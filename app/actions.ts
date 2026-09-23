'use server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { shippingFor } from '@/lib/config'
import { parseImages } from '@/lib/format'
import { integritySignature, isDemoMode, wompi } from '@/lib/wompi'
import { newReference } from '@/lib/orders'

/* ───────── Newsletter ───────── */
export async function subscribe(_: unknown, fd: FormData) {
  const email = z.string().email().safeParse(String(fd.get('email') || '').trim().toLowerCase())
  if (!email.success) return { ok: false, message: 'Correo inválido' }
  await prisma.subscriber.upsert({ where: { email: email.data }, update: {}, create: { email: email.data } })
  return { ok: true, message: '✝ Bienvenido al culto. Tu código: V01D10' }
}

/* ───────── Descuentos ───────── */
export async function checkDiscount(code: string) {
  const d = await prisma.discountCode.findUnique({ where: { code: code.trim().toUpperCase() } })
  if (!d || !d.active) return { ok: false as const, message: 'Código no válido' }
  return { ok: true as const, code: d.code, percent: d.percent }
}

/* ───────── Checkout ───────── */
const CheckoutSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  fullName: z.string().trim().min(3, 'Escribe tu nombre completo'),
  phone: z.string().trim().regex(/^3\d{9}$/, 'Celular colombiano de 10 dígitos (3xx...)'),
  legalIdType: z.enum(['CC', 'CE', 'NIT', 'PP', 'TI']),
  legalId: z.string().trim().regex(/^[0-9A-Za-z]{5,15}$/, 'Documento inválido'),
  address: z.string().trim().min(5, 'Dirección muy corta'),
  address2: z.string().trim().max(120).optional().default(''),
  city: z.string().trim().min(2, 'Ciudad requerida'),
  region: z.string().trim().min(2, 'Departamento requerido'),
  notes: z.string().trim().max(300).optional().default(''),
  discountCode: z.string().trim().max(30).optional().default(''),
  items: z.array(z.object({ variantId: z.string().min(1), qty: z.number().int().min(1).max(20) })).min(1, 'Tu carrito está vacío'),
})

export type CheckoutInput = z.input<typeof CheckoutSchema>
export type CheckoutResult =
  | { ok: true; reference: string; redirectUrl: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string>; stockIssues?: { variantId: string; available: number }[] }

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = CheckoutSchema.safeParse(input)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message
    return { ok: false, message: 'Revisa los datos del formulario', fieldErrors }
  }
  const d = parsed.data

  // Precios y stock SIEMPRE desde la base de datos (nunca confiar en el navegador)
  const variants = await prisma.variant.findMany({
    where: { id: { in: d.items.map((i) => i.variantId) } },
    include: { product: true },
  })
  const stockIssues: { variantId: string; available: number }[] = []
  const lines = d.items.map((i) => {
    const v = variants.find((x) => x.id === i.variantId)
    if (!v || !v.product.active) { stockIssues.push({ variantId: i.variantId, available: 0 }); return null }
    if (v.stock < i.qty) stockIssues.push({ variantId: v.id, available: v.stock })
    return { v, qty: i.qty }
  }).filter(Boolean) as { v: (typeof variants)[number]; qty: number }[]

  if (stockIssues.length) return { ok: false, message: 'Algunos productos ya no tienen stock suficiente. Actualizamos tu carrito.', stockIssues }

  const subtotal = lines.reduce((a, l) => a + l.v.product.price * l.qty, 0)
  let discount = 0, discountCode: string | null = null
  if (d.discountCode) {
    const dc = await prisma.discountCode.findUnique({ where: { code: d.discountCode.toUpperCase() } })
    if (dc?.active) { discount = Math.round((subtotal * dc.percent) / 100); discountCode = dc.code }
  }
  const shipping = shippingFor(subtotal - discount, d.city)
  const total = subtotal - discount + shipping
  const reference = newReference()

  await prisma.order.create({
    data: {
      reference, email: d.email.toLowerCase(), fullName: d.fullName, phone: d.phone, legalIdType: d.legalIdType, legalId: d.legalId,
      address: d.address, address2: d.address2, city: d.city, region: d.region, notes: d.notes,
      subtotal, shipping, discount, discountCode, total,
      items: { create: lines.map((l) => ({
        productId: l.v.productId, variantId: l.v.id, name: l.v.product.name, color: l.v.color, size: l.v.size,
        image: parseImages(l.v.product.images)[0] ?? '', price: l.v.product.price, quantity: l.qty,
      })) },
    },
  })

  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  if (isDemoMode()) return { ok: true, reference, redirectUrl: `/pago-demo?ref=${reference}` }

  // Wompi Web Checkout: montos en centavos + firma de integridad generada en el servidor
  const cents = total * 100
  const p = new URLSearchParams({
    'public-key': wompi.publicKey,
    currency: 'COP',
    'amount-in-cents': String(cents),
    reference,
    'signature:integrity': integritySignature(reference, cents),
    'redirect-url': `${site}/pedido/${reference}`,
    'customer-data:email': d.email,
    'customer-data:full-name': d.fullName,
    'customer-data:phone-number': d.phone,
    'customer-data:phone-number-prefix': '+57',
    'customer-data:legal-id': d.legalId,
    'customer-data:legal-id-type': d.legalIdType,
    'shipping-address:address-line-1': d.address,
    'shipping-address:address-line-2': d.address2 || '-',
    'shipping-address:country': 'CO',
    'shipping-address:city': d.city,
    'shipping-address:region': d.region,
    'shipping-address:phone-number': d.phone,
    'shipping-address:name': d.fullName,
  })
  return { ok: true, reference, redirectUrl: `https://checkout.wompi.co/p/?${p.toString()}` }
}

/* ───────── Stock en vivo para el carrito ───────── */
export async function getStock(variantIds: string[]) {
  const vs = await prisma.variant.findMany({ where: { id: { in: variantIds.slice(0, 50) } }, select: { id: true, stock: true } })
  return Object.fromEntries(vs.map((v) => [v.id, v.stock]))
}
