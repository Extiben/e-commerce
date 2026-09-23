import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { cop } from '@/lib/format'
import { ORDER_STATUS, STORE } from '@/lib/config'
import { updateOrder } from '../../actions'

export default async function OrderDetail(props: PageProps<'/admin/pedidos/[ref]'>) {
  const { ref } = await props.params
  const o = await prisma.order.findUnique({ where: { reference: ref }, include: { items: true } })
  if (!o) notFound()
  const st = ORDER_STATUS[o.status]
  const wa = `https://wa.me/57${o.phone}?text=${encodeURIComponent(`Hola ${o.fullName.split(' ')[0]}, te escribimos de ${STORE.name} sobre tu pedido ${o.reference} 🖤`)}`
  return (
    <>
      <div className="adm-head">
        <div><Link href="/admin/pedidos" className="link" style={{ fontSize: 12 }}>← Pedidos</Link>
          <h1 style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 20 }}>{o.reference}</h1>
          <small className="muted">{o.createdAt.toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</small></div>
        <span className="pill" style={{ color: st?.color }}>{st?.label}</span>
      </div>
      <div className="a-grid">
        <div>
          <div className="panel"><div className="panel-h"><h2>Productos</h2></div><div className="panel-b">
            {o.items.map((it) => (
              <div className="sum-line" key={it.id}>
                <div className="th">{it.image && <img src={it.image} alt="" />}<span className="q">{it.quantity}</span></div>
                <div><h4>{it.name}</h4><small>{it.color} / {it.size}</small></div>
                <div style={{ fontSize: 13 }}>{cop(it.price * it.quantity)}</div>
              </div>
            ))}
            <hr className="divider" style={{ margin: '14px 0' }} />
            <div className="row"><span>Subtotal</span><span>{cop(o.subtotal)}</span></div>
            {o.discount > 0 && <div className="row"><span>Descuento {o.discountCode}</span><span>−{cop(o.discount)}</span></div>}
            <div className="row"><span>Envío</span><span>{o.shipping ? cop(o.shipping) : 'Gratis'}</span></div>
            <div className="row total" style={{ marginBottom: 0 }}><span>Total</span><span>{cop(o.total)}</span></div>
          </div></div>
          <div className="panel"><div className="panel-h"><h2>Pago</h2></div><div className="panel-b muted" style={{ fontSize: 13, lineHeight: 1.9 }}>
            Método: <b style={{ color: 'var(--txt)' }}>{o.paymentMethod ?? '—'}</b><br />
            Transacción Wompi: <code>{o.wompiTxId ?? '—'}</code><br />
            Stock descontado: {o.stockApplied ? 'Sí' : 'No'}
          </div></div>
        </div>
        <div>
          <div className="panel"><div className="panel-h"><h2>Gestionar</h2></div><div className="panel-b">
            <form action={updateOrder} style={{ display: 'grid', gap: 12 }}>
              <input type="hidden" name="ref" value={o.reference} />
              <div><label className="lbl">Estado</label>
                <select name="status" className="input" defaultValue={o.status}>{Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
              <div><label className="lbl">Guía de envío</label><input name="trackingCode" className="input" defaultValue={o.trackingCode ?? ''} placeholder="Servientrega / Interrapidísimo #" /></div>
              <button className="btn btn-red btn-sm">Actualizar</button>
            </form>
          </div></div>
          <div className="panel"><div className="panel-h"><h2>Cliente</h2><a href={wa} target="_blank" rel="noreferrer" className="btn btn-sm">WhatsApp</a></div>
            <div className="panel-b" style={{ fontSize: 13, lineHeight: 1.8 }}>
              <b>{o.fullName}</b><br />{o.legalIdType} {o.legalId}<br />
              <a href={`mailto:${o.email}`} className="link">{o.email}</a><br />{o.phone}
              <hr className="divider" style={{ margin: '12px 0' }} />
              {o.address}{o.address2 && <><br />{o.address2}</>}<br />{o.city}, {o.region}
              {o.notes && <><hr className="divider" style={{ margin: '12px 0' }} /><span className="muted">Nota:</span> {o.notes}</>}
            </div></div>
        </div>
      </div>
    </>
  )
}
