'use server'
import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { destroySession, requireAdmin } from '@/lib/auth'
import { slugify } from '@/lib/format'
import { applyOrderStatus } from '@/lib/orders'

export async function logout() {
  await destroySession()
  redirect('/admin/login')
}

/* ───────── Productos ───────── */
const VariantSchema = z.object({
  id: z.string().optional(), color: z.string().trim().min(1), colorHex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  size: z.string().trim().min(1), stock: z.number().int().min(0).max(100000),
})
const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, 'Nombre requerido'),
  slug: z.string().trim().optional(),
  category: z.string().min(1),
  price: z.number().int().min(1000, 'Precio inválido'),
  compareAt: z.number().int().min(0).nullable(),
  tag: z.string().trim().max(20).nullable(),
  description: z.string().trim().min(10, 'Describe el producto (mín. 10 caracteres)'),
  details: z.string().trim().default(''),
  images: z.array(z.string()).max(12),
  featured: z.boolean(), active: z.boolean(), sortOrder: z.number().int(),
  variants: z.array(VariantSchema).min(1, 'Agrega al menos una variante (color/talla)'),
})
export type ProductInput = z.input<typeof ProductSchema>

export async function saveProduct(input: ProductInput) {
  await requireAdmin()
  const r = ProductSchema.safeParse(input)
  if (!r.success) return { ok: false as const, message: r.error.issues[0].message }
  const d = r.data
  const slug = slugify(d.slug || d.name)
  const clash = await prisma.product.findFirst({ where: { slug, NOT: d.id ? { id: d.id } : undefined } })
  if (clash) return { ok: false as const, message: `Ya existe un producto con la URL "${slug}"` }
  const keys = new Set<string>()
  for (const v of d.variants) {
    const k = `${v.color}|${v.size}`
    if (keys.has(k)) return { ok: false as const, message: `Variante repetida: ${v.color} / ${v.size}` }
    keys.add(k)
  }

  const data = {
    name: d.name, slug, category: d.category, price: d.price, compareAt: d.compareAt || null, tag: d.tag || null,
    description: d.description, details: d.details, images: JSON.stringify(d.images), featured: d.featured, active: d.active, sortOrder: d.sortOrder,
  }
  const id = await prisma.$transaction(async (tx) => {
    const p = d.id ? await tx.product.update({ where: { id: d.id }, data }) : await tx.product.create({ data })
    const existing = await tx.variant.findMany({ where: { productId: p.id } })
    const keep = new Set(d.variants.map((v) => v.id).filter(Boolean))
    // Eliminar variantes quitadas (los pedidos antiguos conservan nombre/talla/color)
    await tx.variant.deleteMany({ where: { productId: p.id, id: { notIn: [...keep] as string[] } } })
    for (const v of d.variants) {
      const sku = `${slug}-${v.color}-${v.size}`.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9-]/g, '')
      const vd = { color: v.color, colorHex: v.colorHex, size: v.size, stock: v.stock, sku }
      if (v.id && existing.some((e) => e.id === v.id)) await tx.variant.update({ where: { id: v.id }, data: vd })
      else await tx.variant.create({ data: { ...vd, productId: p.id } })
    }
    return p.id
  })
  revalidatePath('/', 'layout')
  return { ok: true as const, id }
}

export async function deleteProduct(id: string) {
  await requireAdmin()
  const used = await prisma.orderItem.count({ where: { productId: id } })
  if (used > 0) {
    await prisma.product.update({ where: { id }, data: { active: false } })
  } else {
    await prisma.product.delete({ where: { id } })
  }
  revalidatePath('/', 'layout')
  redirect('/admin/productos')
}

const MAX = 6 * 1024 * 1024
const EXT: Record<string, string> = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/avif': '.avif' }
export async function uploadImages(fd: FormData) {
  await requireAdmin()
  const dir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || 'uploads')
  await mkdir(dir, { recursive: true })
  const urls: string[] = []
  for (const f of fd.getAll('files')) {
    if (!(f instanceof File) || !EXT[f.type] || f.size > MAX) continue
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}${EXT[f.type]}`
    await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), Buffer.from(await f.arrayBuffer()))
    urls.push(`/media/${name}`)
  }
  return urls
}

/* ───────── Pedidos ───────── */
export async function updateOrder(fd: FormData) {
  await requireAdmin()
  const ref = String(fd.get('ref'))
  const status = String(fd.get('status'))
  const trackingCode = String(fd.get('trackingCode') || '').trim() || null
  const order = await prisma.order.findUnique({ where: { reference: ref } })
  if (!order) return
  if (status !== order.status) {
    if (status === 'PAID' || status === 'VOIDED') await applyOrderStatus(ref, status)
    else if (status === 'CANCELLED' && order.stockApplied) {
      await applyOrderStatus(ref, 'VOIDED')
      await prisma.order.update({ where: { reference: ref }, data: { status: 'CANCELLED' } })
    } else await prisma.order.update({ where: { reference: ref }, data: { status } })
  }
  await prisma.order.update({ where: { reference: ref }, data: { trackingCode } })
  revalidatePath('/admin', 'layout')
}

/* ───────── Descuentos ───────── */
export async function createDiscount(fd: FormData) {
  await requireAdmin()
  const code = String(fd.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  const percent = Math.min(90, Math.max(1, Number(fd.get('percent')) || 0))
  if (code.length >= 3) await prisma.discountCode.upsert({ where: { code }, update: { percent, active: true }, create: { code, percent } })
  revalidatePath('/admin/descuentos')
}
export async function toggleDiscount(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get('id'))
  const d = await prisma.discountCode.findUnique({ where: { id } })
  if (d) await prisma.discountCode.update({ where: { id }, data: { active: !d.active } })
  revalidatePath('/admin/descuentos')
}
export async function deleteDiscount(fd: FormData) {
  await requireAdmin()
  await prisma.discountCode.delete({ where: { id: String(fd.get('id')) } }).catch(() => null)
  revalidatePath('/admin/descuentos')
}
