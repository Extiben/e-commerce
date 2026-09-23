import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="status-page" style={{ minHeight: '80vh', display: 'grid', placeContent: 'center' }}>
      <div className="eyebrow">Error 404</div>
      <h1>Perdido en el vacío</h1>
      <p className="muted">Esta página no existe o fue devorada por la oscuridad.</p><br />
      <div><Link href="/" className="btn">Volver al inicio</Link></div>
    </div>
  )
}
