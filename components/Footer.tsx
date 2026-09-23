import Link from 'next/link'
import { STORE } from '@/lib/config'
import Newsletter from './Newsletter'

export default function Footer() {
  return (
    <>
      <Newsletter />
      <footer className="footer">
        <div className="container">
          <div className="foot-grid">
            <div>
              <div className="logo" style={{ justifyContent: 'flex-start', paddingLeft: 0 }}>V<span className="zero">0</span>1D</div>
              <p>Gothic streetwear hecho en {STORE.city} para el mundo. Para los que habitan el vacío y crean en la oscuridad.</p>
            </div>
            <div><h5>TIENDA</h5><ul>
              <li><Link href="/tienda?c=hoodies">Hoodies</Link></li><li><Link href="/tienda?c=camisetas">Camisetas</Link></li>
              <li><Link href="/tienda?c=pantalones">Pantalones</Link></li><li><Link href="/tienda?c=accesorios">Accesorios</Link></li></ul></div>
            <div><h5>AYUDA</h5><ul>
              <li><Link href="/envios">Envíos y cambios</Link></li><li><Link href="/tallas">Guía de tallas</Link></li>
              <li><Link href="/pedido">Rastrear pedido</Link></li><li><a href={`https://wa.me/${STORE.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a></li></ul></div>
            <div><h5>SÍGUENOS</h5><ul>
              <li><a href={STORE.instagram} target="_blank" rel="noreferrer">Instagram</a></li><li><a href={STORE.tiktok} target="_blank" rel="noreferrer">TikTok</a></li>
              <li><a href={`mailto:${STORE.email}`}>{STORE.email}</a></li></ul></div>
          </div>
          <div className="copy"><span>© {new Date().getFullYear()} V01D · TODOS LOS DERECHOS RESERVADOS</span><span>PAGOS SEGUROS CON WOMPI ✝</span></div>
        </div>
      </footer>
    </>
  )
}
