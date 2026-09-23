import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { mapWompiStatus, verifyEvent } from '@/lib/wompi'
import { applyOrderStatus } from '@/lib/orders'

/**
 * URL de eventos de Wompi → configúrala en comercios.wompi.co:
 *   https://TU-DOMINIO/api/wompi/webhook
 */
export async function POST(req: Request) {
  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  if (!verifyEvent(body)) {
    console.warn('[wompi] evento con firma inválida')
    return NextResponse.json({ ok: false, error: 'invalid signature' }, { status: 401 })
  }
  if (body.event !== 'transaction.updated') return NextResponse.json({ ok: true, ignored: body.event })

  const tx = body.data?.transaction
  const order = tx?.reference ? await prisma.order.findUnique({ where: { reference: tx.reference } }) : null
  if (!order) return NextResponse.json({ ok: true, note: 'order not found' }) // 200 para que Wompi no reintente

  // Defensa extra: el monto pagado debe coincidir con el total del pedido
  if (tx.status === 'APPROVED' && Number(tx.amount_in_cents) !== order.total * 100) {
    console.error('[wompi] monto no coincide', tx.reference, tx.amount_in_cents, order.total)
    await applyOrderStatus(order.reference, 'ERROR', { wompiTxId: tx.id })
    return NextResponse.json({ ok: true, note: 'amount mismatch' })
  }

  await applyOrderStatus(order.reference, mapWompiStatus(tx.status), { wompiTxId: tx.id, paymentMethod: tx.payment_method_type })
  return NextResponse.json({ ok: true })
}
