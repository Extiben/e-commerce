import { prisma } from '@/lib/db'
import { createDiscount, deleteDiscount, toggleDiscount } from '../actions'

export const metadata = { title: 'Descuentos' }

export default async function Discounts() {
  const [codes, used] = await Promise.all([
    prisma.discountCode.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.order.groupBy({ by: ['discountCode'], where: { status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] }, discountCode: { not: null } }, _count: true }),
  ])
  const uses = Object.fromEntries(used.map((u) => [u.discountCode, u._count]))
  return (
    <>
      <div className="adm-head"><h1>Códigos de descuento</h1></div>
      <div className="panel"><div className="panel-b">
        <form action={createDiscount} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
          <div><label className="lbl">Código</label><input name="code" className="input" placeholder="HALLOWEEN20" required style={{ textTransform: 'uppercase' }} /></div>
          <div><label className="lbl">% descuento</label><input name="percent" type="number" min={1} max={90} className="input" defaultValue={10} style={{ width: 100 }} /></div>
          <button className="btn btn-red btn-sm">Crear código</button>
        </form>
      </div></div>
      <div className="panel"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th>Código</th><th>Descuento</th><th>Usos pagados</th><th>Estado</th><th></th></tr></thead>
        <tbody>{codes.map((c) => (
          <tr key={c.id}>
            <td style={{ fontFamily: 'monospace' }}>{c.code}</td><td>{c.percent}%</td><td>{uses[c.code] ?? 0}</td>
            <td><form action={toggleDiscount}><input type="hidden" name="id" value={c.id} /><button className="pill" style={{ color: c.active ? '#1f9d55' : '#6b7280', background: 'none' }}>{c.active ? 'Activo' : 'Inactivo'}</button></form></td>
            <td style={{ textAlign: 'right' }}><form action={deleteDiscount}><input type="hidden" name="id" value={c.id} /><button className="link" style={{ background: 'none', border: 'none', fontSize: 12 }}>Eliminar</button></form></td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </>
  )
}
