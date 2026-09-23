import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { cop } from '@/lib/format'
import { isDemoMode } from '@/lib/wompi'
import { applyOrderStatus } from '@/lib/orders'

export const metadata = { title: 'Pago de prueba', robots: { index: false } }

async function resolve(fd: FormData) {
  'use server'
  if (!isDemoMode()) throw new Error('Solo disponible en modo demo')
  const ref = String(fd.get('ref'))
  const method = String(fd.get('method') || 'CARD')
  await applyOrderStatus(ref, fd.get('result') === 'ok' ? 'PAID' : 'DECLINED', { paymentMethod: method, wompiTxId: `DEMO-${Date.now()}` })
  redirect(`/pedido/${ref}`)
}

/** Simula el checkout de Wompi cuando aún no hay llaves configuradas */
export default async function DemoPay(props: PageProps<'/pago-demo'>) {
  if (!isDemoMode()) notFound()
  const { ref } = await props.searchParams
  const order = typeof ref === 'string' ? await prisma.order.findUnique({ where: { reference: ref } }) : null
  if (!order) notFound()
  if (order.status !== 'PENDING') redirect(`/pedido/${order.reference}`)
  return (
    <div className="container">
      <div className="demo-pay">
        <header><b>wompi · simulador</b><small>MODO DEMO</small></header>
        <div className="body">
          <small style={{ color: '#666' }}>Pagando a V01D</small>
          <div style={{ fontSize: 28, fontWeight: 700, margin: '4px 0 4px' }}>{cop(order.total)}</div>
          <small style={{ color: '#666' }}>Ref: {order.reference}</small>
          <form action={resolve} style={{ marginTop: 20 }}>
            <input type="hidden" name="ref" value={order.reference} />
            <label style={{ fontSize: 13, color: '#444' }}>Método de pago</label>
            <select name="method" style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ddd', margin: '6px 0 10px', color: '#111' }}>
              <option value="CARD">Tarjeta de crédito/débito</option><option value="PSE">PSE</option><option value="NEQUI">Nequi</option><option value="BANCOLOMBIA_TRANSFER">Botón Bancolombia</option>
            </select>
            <button name="result" value="ok" style={{ background: '#1f9d55', color: '#fff' }}>✓ Simular pago aprobado</button>
            <button name="result" value="fail" style={{ background: '#eee', color: '#c81e1e' }}>✕ Simular pago rechazado</button>
          </form>
          <p style={{ fontSize: 11, color: '#888', marginTop: 16, lineHeight: 1.5 }}>Esta pantalla solo aparece mientras no configures tus llaves de Wompi en el archivo .env.</p>
        </div>
      </div>
    </div>
  )
}
