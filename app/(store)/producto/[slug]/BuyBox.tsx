'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useCart } from '@/components/CartProvider'
import { STORE } from '@/lib/config'

type V = { id: string; color: string; colorHex: string; size: string; stock: number }
type Props = {
  product: { id: string; slug: string; name: string; price: number; compareAt: number | null; tag: string | null; description: string; details: string; images: string[]; sizes: string[]; variants: V[] }
  crumbs: React.ReactNode; priceLabel: React.ReactNode
}

export default function BuyBox({ product: p, crumbs, priceLabel }: Props) {
  const { add, setOpen, toast } = useCart()
  const colors = useMemo(() => [...new Map(p.variants.map((v) => [v.color, v.colorHex]))], [p.variants])
  const [color, setColor] = useState(colors[0]?.[0] ?? '')
  const single = p.sizes.length === 1
  const [size, setSize] = useState<string | null>(single ? p.sizes[0] : null)
  const [qty, setQty] = useState(1)
  const [img, setImg] = useState(0)

  const variant = p.variants.find((v) => v.color === color && v.size === size)
  const stockFor = (s: string) => p.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0
  const allOut = p.variants.every((v) => v.stock <= 0)
  const images = p.images.length ? p.images : ['/brand/placeholder.svg']

  const onAdd = () => {
    if (!size) return toast('✝ Selecciona una talla')
    if (!variant || variant.stock <= 0) return toast('Agotado en esta talla')
    add({ variantId: variant.id, productId: p.id, slug: p.slug, name: p.name, color, size, price: p.price, image: images[0], max: variant.stock }, qty)
    setOpen(true)
  }

  return (
    <div className="pdp">
      <div className="gallery">
        <div className="gallery-main">
          {p.tag && <span className="tag">{p.tag}</span>}
          <Image src={images[img]} alt={p.name} fill priority sizes="(max-width:900px) 100vw, 55vw" quality={90} />
        </div>
        {images.length > 1 && (
          <div className="thumbs">{images.map((src, i) => (
            <button key={src} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Imagen ${i + 1}`}><img src={src} alt="" /></button>
          ))}</div>
        )}
      </div>

      <div className="pdp-info">
        {crumbs}
        <h1>{p.name}</h1>
        {priceLabel}
        <p className="pdp-desc">{p.description}</p>

        {colors.length > 1 && (<>
          <div className="opt-label"><span>Color: <b>{color}</b></span></div>
          <div className="opts">{colors.map(([name, hex]) => (
            <button key={name} className={`color-btn ${color === name ? 'on' : ''}`} style={{ background: hex }} title={name} aria-label={name}
              onClick={() => { setColor(name); if (!single) setSize(null) }} />
          ))}</div>
        </>)}
        {colors.length === 1 && <div className="opt-label"><span>Color: <b>{color}</b></span></div>}
        {colors.length === 1 && <div style={{ height: 14 }} />}

        {!single && (<>
          <div className="opt-label"><span>Talla {size && <b>{size}</b>}</span><Link href="/tallas" className="link">Guía de tallas</Link></div>
          <div className="opts">{p.sizes.map((s) => (
            <button key={s} className={`size-btn ${size === s ? 'on' : ''}`} disabled={stockFor(s) <= 0} onClick={() => { setSize(s); setQty(1) }}>{s}</button>
          ))}</div>
        </>)}
        {variant && variant.stock > 0 && variant.stock <= 5 && <p className="stock-note">⚠ Solo quedan {variant.stock} unidades</p>}

        <div className="buy-row">
          <div className="qty">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Restar">−</button>
            <span>{qty}</span>
            <button onClick={() => setQty((q) => Math.min(variant?.stock ?? 10, q + 1))} aria-label="Sumar">+</button>
          </div>
          <button className="btn btn-red" onClick={onAdd} disabled={allOut}>{allOut ? 'Agotado' : 'Añadir al carrito'}</button>
        </div>

        <div className="perks">
          <div>🚚<br />Envío gratis desde ${(STORE.freeShippingFrom / 1000).toFixed(0)}k</div>
          <div>↺<br />15 días para cambios</div>
          <div>🔒<br />Pago seguro Wompi</div>
        </div>

        <div className="accordion">
          <details open><summary>Detalles y materiales</summary><p>{p.details || 'Fabricado en Colombia.'}</p></details>
          <details><summary>Envíos</summary><p>Medellín y área metropolitana: 1–2 días hábiles. Resto de Colombia: 2–5 días hábiles con transportadora.</p></details>
          <details><summary>Cambios y devoluciones</summary><p>Tienes 15 días desde que recibes tu pedido para cambios de talla. La prenda debe estar sin uso y con etiquetas. <Link href="/envios" className="link">Ver política</Link></p></details>
        </div>
      </div>
    </div>
  )
}
