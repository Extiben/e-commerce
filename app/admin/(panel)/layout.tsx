import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { logout } from './actions'
import Nav from './Nav'
import '../admin.css'

export const metadata = { title: { default: 'Admin', template: '%s · Admin V01D' }, robots: { index: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="logo">V<span className="zero">0</span>1D</Link>
        <Nav />
        <div style={{ flex: 1 }} />
        <Link href="/" target="_blank">↗ Ver tienda</Link>
        <form action={logout}><button>⎋ Cerrar sesión</button></form>
      </aside>
      <div style={{ minWidth: 0 }}>
        <div className="adm-mob"><Nav /><Link href="/">Tienda ↗</Link></div>
        <main className="adm-main">{children}</main>
      </div>
    </div>
  )
}
