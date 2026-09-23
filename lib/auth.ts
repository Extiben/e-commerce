import 'server-only'
import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE = 'v01d_admin'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 días

const secret = () => {
  const s = process.env.SESSION_SECRET
  if (!s || s.length < 16) throw new Error('Configura SESSION_SECRET en .env')
  return s
}
const sign = (v: string) => crypto.createHmac('sha256', secret()).update(v).digest('hex')

export function checkPassword(pw: string) {
  const real = process.env.ADMIN_PASSWORD || ''
  if (!real) return false
  const a = Buffer.from(sign(pw)), b = Buffer.from(sign(real))
  return crypto.timingSafeEqual(a, b)
}

export async function createSession() {
  const exp = Date.now() + MAX_AGE * 1000
  const token = `${exp}.${sign(String(exp))}`
  ;(await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: MAX_AGE,
  })
}

export async function destroySession() {
  ;(await cookies()).delete(COOKIE)
}

export async function isAdmin() {
  const t = (await cookies()).get(COOKIE)?.value
  if (!t) return false
  const [exp, sig] = t.split('.')
  if (!exp || !sig || Number(exp) < Date.now()) return false
  const good = sign(exp)
  return sig.length === good.length && crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login')
}
