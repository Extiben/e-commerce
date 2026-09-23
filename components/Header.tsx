'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCart } from './CartProvider'
import { IconBag, IconClose, IconMenu, IconSearch } from './Icons'
import { STORE } from '@/lib/config'

const LINKS = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/tienda?c=hoodies', label: 'Hoodies' },
  { href: '/tienda?c=accesorios', label: 'Accesorios' },
  { href: '/nosotros', label: 'Culto' },
]

export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="V01D inicio">
      <img src="/brand/logo.svg" alt="" />V<span className="zero">0</span>1D
    </Link>
  )
}

export default function Header() {
  const { count, setOpen, ready } = useCart()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const path = usePathname()
  const router = useRouter()
  const msgs = [`✝ Envío gratis desde $${STORE.freeShippingFrom.toLocaleString('es-CO')}`, 'Paga con Nequi, PSE, Bancolombia o tarjeta', 'Hecho en Medellín', 'Drops limitados — nunca reponemos', 'Usa V01D10 y obtén 10% off']

  return (
    <>
      <div className="marquee" aria-hidden>
        <div className="marquee-track">{[...msgs, ...msgs, ...msgs, ...msgs].map((m, i) => <span key={i}>{m} ✦</span>)}</div>
      </div>
      <header className="header">
        <nav className="container nav">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button className="icon-btn burger" onClick={() => setMenu(true)} aria-label="Abrir menú"><IconMenu /></button>
            <ul className="nav-links">
              {LINKS.map((l) => <li key={l.href}><Link href={l.href} className={path === l.href ? 'active' : ''}>{l.label}</Link></li>)}
            </ul>
          </div>
          <Logo />
          <div className="nav-icons">
            <button className="icon-btn" onClick={() => setSearch((s) => !s)} aria-label="Buscar"><IconSearch /></button>
            <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Carrito">
              <IconBag />{ready && count > 0 && <span className="badge">{count}</span>}
            </button>
          </div>
        </nav>
        {search && (
          <div className="search-row">
            <form onSubmit={(e) => {
              e.preventDefault()
              const q = new FormData(e.currentTarget).get('q')
              setSearch(false); router.push(`/tienda?q=${encodeURIComponent(String(q || ''))}`)
            }}>
              <input name="q" autoFocus placeholder="Buscar en el vacío..." aria-label="Buscar productos" />
            </form>
          </div>
        )}
      </header>
      <div className={`mobile-menu ${menu ? 'show' : ''}`}>
        <button className="icon-btn" style={{ position: 'absolute', top: 24, right: 20 }} onClick={() => setMenu(false)} aria-label="Cerrar menú"><IconClose /></button>
        {[{ href: '/', label: 'Inicio' }, ...LINKS, { href: '/envios', label: 'Envíos' }].map((l) => (
          <Link key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}</Link>
        ))}
      </div>
    </>
  )
}
