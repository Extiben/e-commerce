import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProduct, getProducts } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import BuyBox from './BuyBox'
import { CATEGORIES } from '@/lib/config'
import { cop } from '@/lib/format'

export async function generateMetadata(props: PageProps<'/producto/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const p = await getProduct(slug)
  if (!p) return { title: 'No encontrado' }
  return { title: p.name, description: p.description, openGraph: { images: p.images.slice(0, 1) } }
}

export default async function ProductPage(props: PageProps<'/producto/[slug]'>) {
  const { slug } = await props.params
  const p = await getProduct(slug)
  if (!p) notFound()
  const related = (await getProducts({ category: p.category, take: 5 })).filter((x) => x.id !== p.id).slice(0, 4)
  const catLabel = CATEGORIES.find((c) => c.slug === p.category)?.label ?? p.category
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description, image: p.images, brand: 'V01D',
    offers: { '@type': 'Offer', priceCurrency: 'COP', price: p.price, availability: p.variants.some((v) => v.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  }

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <BuyBox
        product={{ id: p.id, slug: p.slug, name: p.name, price: p.price, compareAt: p.compareAt, tag: p.tag, description: p.description, details: p.details, images: p.images, sizes: p.sizes, variants: p.variants }}
        crumbs={<div className="crumbs"><Link href="/tienda">Tienda</Link> / <Link href={`/tienda?c=${p.category}`}>{catLabel}</Link></div>}
        priceLabel={<div className="price">{cop(p.price)}{p.compareAt && <s>{cop(p.compareAt)}</s>}</div>}
      />
      {related.length > 0 && (
        <section style={{ paddingBottom: 90 }}>
          <div className="sec-head"><div><div className="eyebrow">También en el vacío</div><h2>Completa el look</h2></div></div>
          <div className="grid">{related.map((r, i) => <ProductCard key={r.id} p={r} i={i} />)}</div>
        </section>
      )}
    </div>
  )
}
