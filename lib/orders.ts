import 'server-only'
import { prisma } from './db'

/**
 * Aplica un nuevo estado a un pedido. Idempotente:
 * el stock solo se descuenta una vez, la primera vez que el pedido pasa a PAID.
 */
export async function applyOrderStatus(reference: string, status: string, extra: { wompiTxId?: string; paymentMethod?: string } = {}) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { reference }, include: { items: true } })
    if (!order) return null
    // No retroceder pedidos ya pagados/enviados por eventos tardíos
    if (['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) && status !== 'VOIDED') return order

    let stockApplied = order.stockApplied
    if (status === 'PAID' && !order.stockApplied) {
      for (const it of order.items) {
        if (it.variantId) await tx.variant.update({ where: { id: it.variantId }, data: { stock: { decrement: it.quantity } } })
      }
      stockApplied = true
    }
    // Si se anula un pago ya aplicado, devolvemos el stock
    if (status === 'VOIDED' && order.stockApplied) {
      for (const it of order.items) {
        if (it.variantId) await tx.variant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } })
      }
      stockApplied = false
    }
    return tx.order.update({
      where: { reference },
      data: { status, stockApplied, ...(extra.wompiTxId ? { wompiTxId: extra.wompiTxId } : {}), ...(extra.paymentMethod ? { paymentMethod: extra.paymentMethod } : {}) },
    })
  })
}

export function newReference() {
  const t = Date.now().toString(36).toUpperCase()
  const r = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `V01D-${t}-${r}`
}
