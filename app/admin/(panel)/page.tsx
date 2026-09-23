import Link from 'next/link'
import { prisma } from '@/lib/db'
import { cop, parseImages } from '@/lib/format'

export const metadata = { title: 'Productos' }

export default async function Products() {
  const products = await prisma.product.findMany({ include: { variants: true }, orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }] })
  return (
    <>
      <div className="adm-head"><h1>Productos</h1><Link href="/admin/productos/nuevo" className="btn btn-red btn-sm">+ Nuevo producto</Link></div>
      <div className="panel"><div className="tbl-wrap"><table className="tbl">
        <thead><tr><th></th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead>
        <tbody>
          {products.map((p) => {
            const stock = p.variants.reduce((a, v) => a + v.stock, 0)
            return (
              <tr key={p.id} className="click">
                <td><Link href={`/admin/productos/${p.id}`}><img src={parseImages(p.images)[0] ?? '/brand/placeholder.svg'} alt="" /></Link></td>
                <td><Link href={`/admin/productos/${p.id}`}><b style={{ fontWeight: 500 }}>{p.name}</b></Link><br /><small className="muted">{p.variants.length} variantes {p.featured && '· ★ destacado'}</small></td>
                <td className="muted" style={{ textTransform: 'capitalize' }}>{p.category}</td>
                <td>{cop(p.price)}</td>
                <td className={stock === 0 ? 'zero' : stock < 10 ? 'low' : ''}>{stock}</td>
                <td><span className="pill" style={{ color: p.active ? '#1f9d55' : '#6b7280' }}>{p.active ? 'Visible' : 'Oculto'}</span></td>
              </tr>
            )
          })}
        </tbody>
      </table></div></div>
    </>
  )
}
