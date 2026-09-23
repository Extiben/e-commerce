import { prisma } from './db'
import { parseImages } from './format'
import { SIZE_ORDER } from './config'

export type ProductCard = {
  id: string; slug: string; name: string; category: string; price: number; compareAt: number | null
  image: string; image2: string | null; tag: string | null; colors: { name: string; hex: string }[]; soldOut: boolean
}

export function toCard(p: any): ProductCard {
  const imgs = parseImages(p.images)
  const colors = new Map<string, string>()
  for (const v of p.variants ?? []) colors.set(v.color, v.colorHex)
  return {
    id: p.id, slug: p.slug, name: p.name, category: p.category, price: p.price, compareAt: p.compareAt,
    image: imgs[0] ?? '/brand/placeholder.svg', image2: imgs[1] ?? null, tag: p.tag,
    colors: [...colors].map(([name, hex]) => ({ name, hex })),
    soldOut: (p.variants ?? []).every((v: any) => v.stock <= 0),
  }
}

export async function getProducts(opts: { category?: string; featured?: boolean; take?: number } = {}) {
  const rows = await prisma.product.findMany({
    where: { active: true, ...(opts.category ? { category: opts.category } : {}), ...(opts.featured ? { featured: true } : {}) },
    include: { variants: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: opts.take,
  })
  return rows.map(toCard)
}

export async function getProduct(slug: string) {
  const p = await prisma.product.findUnique({ where: { slug }, include: { variants: true } })
  if (!p || !p.active) return null
  const sizes = [...new Set(p.variants.map((v) => v.size))].sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b))
  return {
    ...p,
    images: parseImages(p.images),
    sizes,
    variants: p.variants.map((v) => ({ id: v.id, color: v.color, colorHex: v.colorHex, size: v.size, stock: v.stock })),
  }
}
