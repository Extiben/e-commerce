'use client'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { cop } from '@/lib/format'
import { STORE } from '@/lib/config'

export default function CartDrawer() {
  const { items, open, setOpen, subtotal, update, remove } = useCart()
  const missing = Math.max(0, STORE.freeShippingFrom - subtotal)
  const pct = Math.min(100, (subtotal / STORE.freeShippingFrom) * 100)

  return (
    <>
      <div className={`overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'show' : ''}`} aria-hidden={!open} aria-label="Carrito">
        <div className="drawer-head">
          <h3>Tu carrito</h3>
          <button className="x" onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
        </div>
        {items.length > 0 && (
          <div className="ship-bar">
            {missing === 0 ? '✦ Tienes envío gratis' : <>Te faltan <b style={{ color: 'var(--txt)' }}>{cop(missing)}</b> para envío gratis</>}
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        )}
        <div className="drawer-items">
          {items.length === 0 ? (
            <div className="empty"><span className="goth">Vacío</span>Tu carrito está en el vacío.<br />Llénalo de oscuridad.</div>
          ) : items.map((i) => (
            <div className="line" key={i.variantId}>
              <Link href={`/producto/${i.slug}`} onClick={() => setOpen(false)}><img src={i.image} alt={i.name} /></Link>
              <div>
                <h4>{i.name}</h4>
                <small>{i.color} / {i.size}</small>
                <div className="qty">
                  <button onClick={() => update(i.variantId, i.qty - 1)} aria-label="Restar">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => update(i.variantId, i.qty + 1)} disabled={i.qty >= i.max} aria-label="Sumar">+</button>
                </div>
                <button className="rm" onClick={() => remove(i.variantId)}>Eliminar</button>
              </div>
              <div className="price" style={{ fontSize: 13 }}>{cop(i.price * i.qty)}</div>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          {items.length > 0 ? (
            <>
              <div className="row total"><span>Subtotal</span><span>{cop(subtotal)}</span></div>
              <p className="muted" style={{ fontSize: 12, marginBottom: 14 }}>Envío y descuentos se calculan en el checkout.</p>
              <Link href="/checkout" className="btn btn-red btn-block" onClick={() => setOpen(false)}>Finalizar compra →</Link>
            </>
          ) : (
            <Link href="/tienda" className="btn btn-block" onClick={() => setOpen(false)}>Explorar la tienda</Link>
          )}
        </div>
      </aside>
    </>
  )
}
