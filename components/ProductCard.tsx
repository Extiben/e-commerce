import Link from 'next/link'
import Image from 'next/image'
import type { ProductCard as P } from '@/lib/products'
import { cop } from '@/lib/format'

export default function ProductCard({ p, i = 0 }: { p: P; i?: number }) {
  const tag = p.soldOut ? 'Agotado' : p.tag
  return (
    <Link href={`/producto/${p.slug}`} className="card" style={{ animationDelay: `${i * 60}ms` }}>
      <div className="card-img">
        {tag && <span className={`tag ${p.soldOut ? 'dark' : tag === 'Nuevo' ? 'light' : ''}`}>{tag}</span>}
        <Image src={p.image} alt={p.name} fill sizes="(max-width:900px) 50vw, 25vw" />
        {p.image2 && <Image className="img2" src={p.image2} alt="" fill sizes="(max-width:900px) 50vw, 25vw" />}
        <span className="card-cta">Ver producto</span>
      </div>
      <div className="card-info">
        <div className="card-cat">{p.category}</div>
        <div className="card-name">{p.name}</div>
        <div className="price">{cop(p.price)}{p.compareAt && <s>{cop(p.compareAt)}</s>}</div>
        {p.colors.length > 1 && <div className="swatches">{p.colors.map((c) => <i key={c.name} style={{ background: c.hex }} title={c.name} />)}</div>}
      </div>
    </Link>
  )
}
