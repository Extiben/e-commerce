import { STORE } from '@/lib/config'
import { cop } from '@/lib/format'
export const metadata = { title: 'Envíos y cambios' }
export default function Shipping() {
  return (
    <div className="container">
      <div className="page-head"><div className="eyebrow">Ayuda</div><h1>Envíos y cambios</h1></div>
      <div className="prose">
        <h2>Tarifas de envío</h2>
        <ul>
          <li>Medellín y área metropolitana: {cop(STORE.shippingMedellin)} · 1–2 días hábiles.</li>
          <li>Resto de Colombia: {cop(STORE.shippingNational)} · 2–5 días hábiles.</li>
          <li><b>Envío gratis</b> en pedidos desde {cop(STORE.freeShippingFrom)}.</li>
        </ul>
        <p>Los pedidos se despachan de lunes a viernes. Recibirás el número de guía por correo cuando tu pedido salga.</p>
        <h2>Cambios</h2>
        <p>Tienes 15 días calendario desde que recibes tu pedido para solicitar cambio de talla o de producto. La prenda debe estar sin uso, sin lavar y con etiquetas. El primer cambio por talla es gratis.</p>
        <h2>Retracto y devoluciones</h2>
        <p>De acuerdo con el Estatuto del Consumidor (Ley 1480 de 2011), puedes ejercer el derecho de retracto dentro de los 5 días hábiles siguientes a la entrega. Escríbenos a {STORE.email} o por WhatsApp con tu número de pedido.</p>
        <h2>Pagos</h2>
        <p>Procesamos pagos con Wompi (Grupo Bancolombia): tarjetas de crédito y débito, PSE, Nequi, Botón Bancolombia y Daviplata. V01D nunca almacena los datos de tu tarjeta.</p>
      </div>
    </div>
  )
}
