'use client'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useCart } from '@/components/CartProvider'
import { checkDiscount, createOrder, getStock } from '@/app/actions'
import { DEPARTAMENTOS, shippingFor } from '@/lib/config'
import { cop } from '@/lib/format'

const initial = { email: '', fullName: '', phone: '', legalIdType: 'CC', legalId: '', address: '', address2: '', city: 'Medellín', region: 'Antioquia', notes: '' }

export default function CheckoutForm({ mode }: { mode: 'demo' | 'sandbox' | 'live' }) {
  const { items, subtotal, ready, update } = useCart()
  const [f, setF] = useState(initial)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [disc, setDisc] = useState<{ code: string; percent: number } | null>(null)
  const [codeMsg, setCodeMsg] = useState<string | null>(null)
  const [pending, start] = useTransition()

  // Sincroniza stock real al entrar
  useEffect(() => {
    if (!ready || !items.length) return
    getStock(items.map((i) => i.variantId)).then((s) => {
      items.forEach((i) => { const st = s[i.variantId] ?? 0; if (i.qty > st) update(i.variantId, st) })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const discount = disc ? Math.round((subtotal * disc.percent) / 100) : 0
  const shipping = shippingFor(subtotal - discount, f.city)
  const total = subtotal - discount + shipping
  const set = (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: '' })
  }

  const applyCode = () => start(async () => {
    const r = await checkDiscount(code)
    if (r.ok) { setDisc({ code: r.code, percent: r.percent }); setCodeMsg(`✓ ${r.percent}% de descuento aplicado`) }
    else { setDisc(null); setCodeMsg(r.message) }
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null)
    start(async () => {
      const r = await createOrder({ ...f, legalIdType: f.legalIdType as 'CC', discountCode: disc?.code ?? '', items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })) })
      if (r.ok) { window.location.href = r.redirectUrl; return }
      setMsg(r.message); setErrors(r.fieldErrors ?? {})
      r.stockIssues?.forEach((s) => update(s.variantId, s.available))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  if (!ready) return <div style={{ minHeight: '60vh' }} />
  if (!items.length) return (
    <div className="status-page"><h1>Carrito vacío</h1><p className="muted">No hay nada que pagar todavía.</p><br /><Link href="/tienda" className="btn">Ir a la tienda</Link></div>
  )

  const input = (k: keyof typeof initial, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, full = false) => (
    <div className={full ? 'full' : ''}>
      <label className="lbl" htmlFor={k}>{label}</label>
      <input id={k} className={`input ${errors[k] ? 'err' : ''}`} value={f[k]} onChange={set(k)} {...props} />
      {errors[k] && <div className="err-msg">{errors[k]}</div>}
    </div>
  )

  return (
    <form className="checkout" onSubmit={submit} noValidate>
      <div className="co-form">
        <div className="eyebrow">Paso final</div>
        <h1>Checkout</h1>
        {mode === 'demo' && <div className="alert info">🧪 <b>Modo demo:</b> aún no hay llaves de Wompi configuradas. El pago será simulado. Configura las llaves en <code>.env</code> para cobrar de verdad.</div>}
        {mode === 'sandbox' && <div className="alert info">🧪 <b>Wompi Sandbox:</b> usa datos de prueba, no se cobrará dinero real.</div>}
        {msg && <div className="alert">{msg}</div>}

        <div className="fieldset"><h3>Contacto</h3><div className="fields">
          {input('email', 'Correo electrónico', { type: 'email', autoComplete: 'email', required: true }, true)}
          {input('fullName', 'Nombre completo', { autoComplete: 'name', required: true })}
          {input('phone', 'Celular', { type: 'tel', autoComplete: 'tel-national', inputMode: 'numeric', maxLength: 10, placeholder: '3001234567' })}
          <div>
            <label className="lbl" htmlFor="legalIdType">Tipo de documento</label>
            <select id="legalIdType" className="input" value={f.legalIdType} onChange={set('legalIdType')}>
              <option value="CC">Cédula de ciudadanía</option><option value="CE">Cédula de extranjería</option>
              <option value="TI">Tarjeta de identidad</option><option value="PP">Pasaporte</option><option value="NIT">NIT</option>
            </select>
          </div>
          {input('legalId', 'Número de documento', { inputMode: 'numeric' })}
        </div></div>

        <div className="fieldset"><h3>Envío</h3><div className="fields">
          {input('address', 'Dirección', { autoComplete: 'address-line1', placeholder: 'Calle 10 # 43-20' }, true)}
          {input('address2', 'Apto, torre, barrio (opcional)', { autoComplete: 'address-line2' }, true)}
          {input('city', 'Ciudad / municipio', { autoComplete: 'address-level2' })}
          <div>
            <label className="lbl" htmlFor="region">Departamento</label>
            <select id="region" className="input" value={f.region} onChange={set('region')}>{DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}</select>
          </div>
          <div className="full">
            <label className="lbl" htmlFor="notes">Notas del pedido (opcional)</label>
            <textarea id="notes" className="input" rows={2} value={f.notes} onChange={set('notes')} />
          </div>
        </div></div>

        <button className="btn btn-red btn-block" disabled={pending} style={{ padding: 18 }}>
          {pending ? 'Procesando…' : `Pagar ${cop(total)} →`}
        </button>
        <div className="pay-logos"><span>PSE</span><span>NEQUI</span><span>BANCOLOMBIA</span><span>VISA</span><span>MASTERCARD</span><span>DAVIPLATA</span></div>
        <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>Serás redirigido a Wompi (Bancolombia) para completar el pago de forma segura.</p>
      </div>

      <aside className="co-sum"><div className="co-sum-inner">
        <h3 className="serif" style={{ letterSpacing: '.2em', fontSize: 12, fontWeight: 400, marginBottom: 22, color: 'var(--muted)' }}>RESUMEN</h3>
        {items.map((i) => (
          <div className="sum-line" key={i.variantId}>
            <div className="th"><img src={i.image} alt="" /><span className="q">{i.qty}</span></div>
            <div><h4>{i.name}</h4><small>{i.color} / {i.size}</small></div>
            <div style={{ fontSize: 13 }}>{cop(i.price * i.qty)}</div>
          </div>
        ))}
        <div className="promo">
          <input className="input" placeholder="Código de descuento" value={code} onChange={(e) => setCode(e.target.value)} aria-label="Código de descuento" />
          <button type="button" className="btn btn-sm" onClick={applyCode} disabled={!code || pending}>Aplicar</button>
        </div>
        {codeMsg && <p style={{ fontSize: 12, marginTop: -8, marginBottom: 14, color: disc ? '#4ade80' : 'var(--accent2)' }}>{codeMsg}</p>}
        <div className="row"><span>Subtotal</span><span>{cop(subtotal)}</span></div>
        {discount > 0 && <div className="row"><span>Descuento ({disc?.code})</span><span>−{cop(discount)}</span></div>}
        <div className="row"><span>Envío</span><span>{shipping ? cop(shipping) : 'Gratis'}</span></div>
        <div className="row total"><span>Total</span><span>{cop(total)}</span></div>
      </div></aside>
    </form>
  )
}
