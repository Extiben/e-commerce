import crypto from 'node:crypto'

export const wompi = {
  publicKey: process.env.WOMPI_PUBLIC_KEY || '',
  privateKey: process.env.WOMPI_PRIVATE_KEY || '',
  integrity: process.env.WOMPI_INTEGRITY_SECRET || '',
  events: process.env.WOMPI_EVENTS_SECRET || '',
}

/** Sin llaves configuradas → modo demo (pago simulado) */
export const isDemoMode = () => !wompi.publicKey || !wompi.integrity

export const isSandbox = () => wompi.publicKey.startsWith('pub_test_')

export const apiBase = () =>
  isSandbox() ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1'

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

/** Firma de integridad: SHA256(referencia + montoEnCentavos + moneda + secreto) */
export function integritySignature(reference: string, amountInCents: number, currency = 'COP') {
  return sha256(`${reference}${amountInCents}${currency}${wompi.integrity}`)
}

/** Verifica el checksum de un evento (webhook) de Wompi */
export function verifyEvent(body: any): boolean {
  if (!wompi.events) return false
  const props: string[] = body?.signature?.properties ?? []
  const checksum: string = body?.signature?.checksum ?? ''
  const values = props.map((path) =>
    path.split('.').reduce((obj: any, k) => (obj == null ? obj : obj[k]), body.data),
  )
  const computed = sha256(values.join('') + body.timestamp + wompi.events)
  const a = Buffer.from(computed.toLowerCase())
  const b = Buffer.from(String(checksum).toLowerCase())
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/** Consulta una transacción desde el servidor (fallback si el webhook tarda) */
export async function fetchTransaction(id: string) {
  const res = await fetch(`${apiBase()}/transactions/${encodeURIComponent(id)}`, {
    headers: wompi.privateKey ? { Authorization: `Bearer ${wompi.privateKey}` } : {},
    cache: 'no-store',
  })
  if (!res.ok) return null
  const json = await res.json()
  return json?.data ?? null
}

export const mapWompiStatus = (s: string) =>
  ({ APPROVED: 'PAID', DECLINED: 'DECLINED', VOIDED: 'VOIDED', ERROR: 'ERROR' } as Record<string, string>)[s] ?? 'PENDING'
