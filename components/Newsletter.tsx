'use client'
import { useActionState } from 'react'
import { subscribe } from '@/app/actions'

export default function Newsletter() {
  const [state, action, pending] = useActionState(subscribe, null)
  return (
    <section className="news">
      <div className="eyebrow">Únete al aquelarre</div>
      <h2>Entra al vacío</h2>
      <p className="muted">Acceso anticipado a los drops y 10% de descuento en tu primera compra.</p>
      <form className="news-form" action={action}>
        <input type="email" name="email" placeholder="tu@correo.com" required aria-label="Correo" />
        <button disabled={pending}>{pending ? '...' : 'Unirme'}</button>
      </form>
      {state && <p className="form-msg">{state.message}</p>}
    </section>
  )
}
