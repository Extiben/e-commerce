import Link from 'next/link'
import { prisma } from '@/lib/db'
import { cop } from '@/lib/format'
import { ORDER_STATUS } from '@/lib/config'

export const metadata = { title: 'Pedidos' }

export default async function Orders(props: PageProps<'/admin/pedidos'>) {
  const sp = await props.searchParams
  const s = typeof sp.s === 'string' ? sp.s : ''
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const orders = await prisma.order.findMany({
    where: { ...(s ? { status: s } : {}), ...(q ? { OR: [{ reference: { contains: q.toUpperCase() } }, { email: { contains: q.toLowerCase() } }, { fullName: { contains: q } }] } : {}) },
    include: { _count: { select: { items: true } } }, orderBy: { createdAt: 'desc' }, take: 200,
  })
  return (
    <>
      <div className="adm-head"><h1>Pedidos</h1>
        <form style={{ display: 'flex', gap: 8 }}>
          <input name="q" defaultValue={q} className="input" placeholder="Referencia, correo o nombre" style={{ width: 240 }} />
          {s && <input type="hidden" name="s" value={s} />}
          <button className="btn btn-sm">Buscar</button>
        </form>
      </div>
      <div className="chips" style={{ marginBottom: 18 }}>
        <Link href="/admin/pedidos" className={`chip ${!s ? 'active' : ''}`}>Todos</Link>
        {['PAID', 'SHIPPED', 'DELIVERED', 'PENDING', 'DECLINED', 'CANCELLED'].map((k) => (
          <Link key={k} href={`/admin/pedidos?s=${k}`} className={`chip ${s === k ? 'active' : ''}`}>{ORDER_STATUS[k].label}</Link>
        ))}
      </div>
      <div className="panel"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Pedido</th><th>Fecha</th><th>Cliente</th><th>Ciudad</th><th>Estado</th><th style={{ textAlign: 'right' }}>Total</th></tr></thead>
        <tbody>
          {orders.length === 0 && <tr><td colSpan={6} className="muted">Sin pedidos.</td></tr>}
          {orders.map((o) => (
            <tr key={o.id} className="click">
              <td><Link href={`/admin/pedidos/${o.reference}`} style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.reference}</Link></td>
              <td className="muted">{o.createdAt.toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'short', timeStyle: 'short' })}</td>
              <td>{o.fullName}<br /><small className="muted">{o.email}</small></td>
              <td className="muted">{o.city}</td>
              <td><span className="pill" style={{ color: ORDER_STATUS[o.status]?.color }}>{ORDER_STATUS[o.status]?.label}</span></td>
              <td style={{ textAlign: 'right' }}>{cop(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </>
  )
}
