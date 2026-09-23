import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { parseImages } from '@/lib/format'
import ProductForm from './ProductForm'
import { SIZE_ORDER } from '@/lib/config'

export default async function EditProduct(props: PageProps<'/admin/productos/[id]'>) {
  const { id } = await props.params
  if (id === 'nuevo') return <ProductForm />
  const p = await prisma.product.findUnique({ where: { id }, include: { variants: true } })
  if (!p) notFound()
  return (
    <ProductForm initial={{
      id: p.id, name: p.name, slug: p.slug, category: p.category, price: p.price, compareAt: p.compareAt, tag: p.tag,
      description: p.description, details: p.details, images: parseImages(p.images), featured: p.featured, active: p.active, sortOrder: p.sortOrder,
      variants: [...p.variants].sort((a, b) => a.color.localeCompare(b.color) || SIZE_ORDER.indexOf(a.size) - SIZE_ORDER.indexOf(b.size)).map((v) => ({ id: v.id, color: v.color, colorHex: v.colorHex, size: v.size, stock: v.stock })),
    }} />
  )
}
