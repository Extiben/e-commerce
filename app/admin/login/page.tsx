import { redirect } from 'next/navigation'
import { checkPassword, createSession, isAdmin } from '@/lib/auth'
import '../admin.css'

export const metadata = { title: 'Admin', robots: { index: false } }

async function login(fd: FormData) {
  'use server'
  await new Promise((r) => setTimeout(r, 400)) // frena ataques de fuerza bruta
  if (!checkPassword(String(fd.get('password') || ''))) redirect('/admin/login?e=1')
  await createSession()
  redirect('/admin')
}

export default async function Login(props: PageProps<'/admin/login'>) {
  if (await isAdmin()) redirect('/admin')
  const sp = await props.searchParams
  return (
    <div className="login adm" style={{ display: 'grid' }}>
      <form action={login}>
        <div className="logo" style={{ justifyContent: 'center', marginBottom: 6 }}>V<span className="zero">0</span>1D</div>
        <p className="muted" style={{ textAlign: 'center', fontSize: 12, letterSpacing: '.2em', marginBottom: 26 }}>PANEL DE ADMINISTRACIÓN</p>
        {sp.e && <div className="alert">Contraseña incorrecta</div>}
        <label className="lbl">Contraseña</label>
        <input className="input" type="password" name="password" required autoFocus />
        <button className="btn btn-red btn-block" style={{ marginTop: 18 }}>Entrar</button>
      </form>
    </div>
  )
}
