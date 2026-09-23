'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
const items = [['/admin', '◈ Resumen'], ['/admin/pedidos', '▤ Pedidos'], ['/admin/productos', '◇ Productos'], ['/admin/descuentos', '% Descuentos']]
export default function Nav() {
  const p = usePathname()
  return <>{items.map(([h, l]) => <Link key={h} href={h} className={(h === '/admin' ? p === h : p.startsWith(h)) ? 'on' : ''}>{l}</Link>)}</>
}
