'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter(), path = usePathname(), sp = useSearchParams()
  return (
    <select className="select" value={value} aria-label="Ordenar" onChange={(e) => {
      const p = new URLSearchParams(sp.toString())
      e.target.value ? p.set('sort', e.target.value) : p.delete('sort')
      router.push(`${path}?${p}`)
    }}>
      <option value="">Destacados</option>
      <option value="new">Novedades</option>
      <option value="low">Precio: menor a mayor</option>
      <option value="high">Precio: mayor a menor</option>
    </select>
  )
}
