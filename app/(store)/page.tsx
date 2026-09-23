import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'

export const metadata = { title: 'Rastrear pedido' }

async function find(fd: FormData) {
  'use server'
  const ref = String(fd.get('ref') || '').trim().toUpperCase()
  const email = String(fd.get('email') || '').trim().toLowerCase()
  const o = await prisma.order.findFirst({ where: { reference: ref, email } })
  redirect(o ? `/pedido/${o.reference}` : '/pedido?e=1')
}

export default async function Track(props: PageProps<'/pedido'>) {
  const sp = await props.searchParams
  return (
    <div className="status-page">
      <div className="eyebrow">Seguimiento</div>
      <h1>Rastrear pedido</h1>
      {sp.e && <div className="alert">No encontramos un pedido con esos datos.</div>}
      <form action={find} className="fields" style={{ textAlign: 'left', marginTop: 24 }}>
        <div className="full"><label className="lbl">Número de pedido</label><input name="ref" className="input" placeholder="V01D-XXXX-XXXXX" required /></div>
        <div className="full"><label className="lbl">Correo de la compra</label><input name="email" type="email" className="input" required /></div>
        <button className="btn btn-red full">Buscar</button>
      </form>
    </div>
  )
}
