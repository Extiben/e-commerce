import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { toCard } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import { CATEGORIES } from '@/lib/config'
import SortSelect from './SortSelect'

export const metadata: Metadata = { title: 'Tienda' }

export default async function Shop(props: PageProps<'/tienda'>) {
  const sp = await props.searchParams
  const c = typeof sp.c === 'string' ? sp.c : ''
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const sort = typeof sp.sort === 'string' ? sp.sort : ''

  const rows = await prisma.product.findMany({
    where: {
      active: true,
      ...(c ? { category: c } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }, { category: { contains: q.toLowerCase() } }] } : {}),
    },
    include: { variants: true },
    orderBy: sort === 'low' ? { price: 'asc' } : sort === 'high' ? { price: 'desc' } : sort === 'new' ? { createdAt: 'desc' } : [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })
  const products = rows.map(toCard)
  const title = q ? `“${q}”` : CATEGORIES.find((x) => x.slug === c)?.label ?? 'La cripta'
  const href = (cat: string) => { const p = new URLSearchParams(); if (cat) p.set('c', cat); if (sort) p.set('sort', sort); return `/tienda${p.size ? '?' + p : ''}` }

  return (
    <div className="container">
      <div className="page-head">
        <div className="eyebrow">{q ? 'Resultados de búsqueda' : 'Tienda'}</div>
        <h1>{title}</h1>
      </div>
      <div className="toolbar">
        <div className="chips">
          <Link href={href('')} className={`chip ${!c ? 'active' : ''}`}>Todo</Link>
          {CATEGORIES.map((x) => <Link key={x.slug} href={href(x.slug)} className={`chip ${c === x.slug ? 'active' : ''}`}>{x.label}</Link>)}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <small className="muted" style={{ letterSpacing: '.2em', fontSize: 11 }}>{products.length} PIEZAS</small>
          <SortSelect value={sort} />
        </div>
      </div>
      {products.length ? (
        <div className="grid" style={{ paddingBottom: 90 }}>{products.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      ) : (
        <div className="empty"><span className="goth">Nada por aquí</span>Solo telarañas. Prueba otra búsqueda.<br /><br /><Link href="/tienda" className="btn btn-sm">Ver todo</Link></div>
      )}
    </div>
  )
}
