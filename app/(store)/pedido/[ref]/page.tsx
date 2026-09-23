import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { cop } from '@/lib/format'
import { ORDER_STATUS } from '@/lib/config'
import { fetchTransaction, isDemoMode, mapWompiStatus } from '@/lib/wompi'
import { applyOrderStatus } from '@/lib/orders'
import { IconCheck, IconClock, IconX } from '@/components/Icons'
import ClearCart from './ClearCart'
import AutoRefresh from './AutoRefresh'

export const metadata: Metadata = { title: 'Tu pedido', robots: { index: false } }

export default async function OrderPage(props: PageProps<'/pedido/[ref]'>) {
  const { ref } = await props.params
  const sp = await props.searchParams
  let order = await prisma.order.findUnique({ where: { reference: ref }, include: { items: true } })
  if (!order) notFound()

  // Wompi redirige con ?id=TX. Si el webhook aún no llegó, consultamos desde el servidor.
  const txId = typeof sp.id === 'string' ? sp.id : order.wompiTxId
  if (order.status === 'PENDING' && txId && !isDemoMode()) {
    const tx = await fetchTransaction(txId).catch(() => null)
    if (tx && tx.reference === order.reference && tx.status !== 'PENDING') {
      const ok = tx.status !== 'APPROVED' || Number(tx.amount_in_cents) === order.total * 100
      await applyOrderStatus(order.reference, ok ? mapWompiStatus(tx.status) : 'ERROR', { wompiTxId: tx.id, paymentMethod: tx.payment_method_type })
      order = (await prisma.order.findUnique({ where: { reference: ref }, include: { items: true } }))!
    }
  }

  const s = order.status
  const paid = ['PAID', 'SHIPPED', 'DELIVERED'].includes(s)
  const failed = ['DECLINED', 'ERROR', 'VOIDED', 'CANCELLED'].includes(s)
  const st = ORDER_STATUS[s] ?? ORDER_STATUS.PENDING

  return (
    <div className="status-page">
      {paid && <ClearCart />}
      {s === 'PENDING' && <AutoRefresh />}
      <div className="status-icon" style={{ color: st.color, borderColor: st.color }}>{paid ? <IconCheck /> : failed ? <IconX /> : <IconClock />}</div>
      <h1>{paid ? 'Pacto sellado' : failed ? 'Pago no completado' : 'Esperando el pago'}</h1>
      <p className="muted">
        {paid ? <>Gracias, {order.fullName.split(' ')[0]}. Te escribiremos a <b style={{ color: 'var(--txt)' }}>{order.email}</b> cuando tu pedido salga.</>
          : failed ? 'Tu pago fue rechazado o anulado. No se realizó ningún cobro. Puedes intentarlo de nuevo.'
          : 'Estamos confirmando tu pago con Wompi. Esta página se actualiza sola.'}
      </p>

      <div className="receipt">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div><small className="muted">PEDIDO</small><div className="serif">{order.reference}</div></div>
          <span className="pill" style={{ color: st.color, alignSelf: 'center' }}>{st.label}</span>
        </div>
        <div>
          {order.items.map((it) => (
            <div className="sum-line" key={it.id}>
              <div className="th">{it.image && <img src={it.image} alt="" />}<span className="q">{it.quantity}</span></div>
              <div><h4>{it.name}</h4><small>{it.color} / {it.size}</small></div>
              <div style={{ fontSize: 13 }}>{cop(it.price * it.quantity)}</div>
            </div>
          ))}
        </div>
        <div>
          <div className="row"><span>Subtotal</span><span>{cop(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="row"><span>Descuento</span><span>−{cop(order.discount)}</span></div>}
          <div className="row"><span>Envío</span><span>{order.shipping ? cop(order.shipping) : 'Gratis'}</span></div>
          <div className="row total" style={{ marginBottom: 0 }}><span>Total</span><span>{cop(order.total)}</span></div>
        </div>
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
          <b style={{ color: 'var(--txt)' }}>Envío a:</b> {order.address}{order.address2 && `, ${order.address2}`} — {order.city}, {order.region}
          {order.trackingCode && <><br /><b style={{ color: 'var(--txt)' }}>Guía de envío:</b> {order.trackingCode}</>}
        </div>
      </div>
      <Link href={failed ? '/checkout' : '/tienda'} className="btn">{failed ? 'Reintentar pago' : 'Seguir comprando'}</Link>
    </div>
  )
}
