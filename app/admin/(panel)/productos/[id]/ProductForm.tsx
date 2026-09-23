'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { deleteProduct, saveProduct, uploadImages, type ProductInput } from '../../actions'
import { CATEGORIES } from '@/lib/config'

type V = { id?: string; color: string; colorHex: string; size: string; stock: number }
const empty: ProductInput = { name: '', slug: '', category: 'hoodies', price: 0, compareAt: null, tag: null, description: '', details: '', images: [], featured: false, active: true, sortOrder: 0, variants: [] }
const PRESETS: Record<string, string[]> = { Ropa: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 'Talla única': ['Única'], Anillos: ['6', '7', '8', '9', '10'] }

export default function ProductForm({ initial }: { initial?: ProductInput }) {
  const router = useRouter()
  const [f, setF] = useState<ProductInput>(initial ?? empty)
  const [variants, setVariants] = useState<V[]>((initial?.variants as V[]) ?? [])
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null)
  const [pending, start] = useTransition()
  const [uploading, setUploading] = useState(false)
  // Generador rápido de variantes
  const [gColor, setGColor] = useState('Negro'), [gHex, setGHex] = useState('#111113'), [gPreset, setGPreset] = useState('Ropa'), [gStock, setGStock] = useState(10)

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => setF((p) => ({ ...p, [k]: v }))
  const images = f.images as string[]

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const fd = new FormData(); [...files].forEach((x) => fd.append('files', x))
    const urls = await uploadImages(fd)
    set('images', [...images, ...urls]); setUploading(false)
    if (urls.length < files.length) setMsg({ ok: false, t: 'Algunas imágenes no se subieron (formato JPG/PNG/WEBP, máx. 6 MB)' })
  }
  const moveImg = (i: number, d: number) => { const a = [...images]; const [x] = a.splice(i, 1); a.splice(Math.max(0, i + d), 0, x); set('images', a) }
  const generate = () => {
    const add = PRESETS[gPreset].filter((s) => !variants.some((v) => v.color === gColor && v.size === s)).map((s) => ({ color: gColor, colorHex: gHex, size: s, stock: gStock }))
    setVariants([...variants, ...add])
  }
  const setVar = (i: number, k: keyof V, v: string | number) => setVariants(variants.map((x, j) => (j === i ? { ...x, [k]: v } : x)))

  const save = () => start(async () => {
    setMsg(null)
    const r = await saveProduct({ ...f, variants })
    if (!r.ok) return setMsg({ ok: false, t: r.message })
    setMsg({ ok: true, t: '✓ Guardado' })
    if (!f.id) router.replace(`/admin/productos/${r.id}`)
    else router.refresh()
  })

  return (
    <>
      <div className="adm-head">
        <div><Link href="/admin/productos" className="link" style={{ fontSize: 12 }}>← Productos</Link><h1 style={{ marginTop: 6 }}>{f.id ? f.name || 'Editar producto' : 'Nuevo producto'}</h1></div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {msg && <span className={msg.ok ? 'ok-msg' : 'err-msg'} style={{ marginTop: 0 }}>{msg.t}</span>}
          {f.slug && <Link href={`/producto/${f.slug}`} target="_blank" className="btn btn-sm">Ver ↗</Link>}
          <button className="btn btn-red btn-sm" onClick={save} disabled={pending}>{pending ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </div>

      <div className="a-grid">
        <div>
          <div className="panel"><div className="panel-h"><h2>Información</h2></div><div className="panel-b a-fields">
            <div className="full"><label className="lbl">Nombre</label><input className="input" value={f.name} onChange={(e) => set('name', e.target.value)} /></div>
            <div className="full"><label className="lbl">Descripción</label><textarea className="input" rows={4} value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
            <div className="full"><label className="lbl">Detalles y materiales</label><textarea className="input" rows={2} value={f.details ?? ''} onChange={(e) => set('details', e.target.value)} placeholder="100% algodón 450 GSM · Hecho en Medellín" /></div>
            <div><label className="lbl">Precio (COP)</label><input className="input" type="number" min={0} step={1000} value={f.price || ''} onChange={(e) => set('price', Number(e.target.value))} /></div>
            <div><label className="lbl">Precio antes (opcional, tachado)</label><input className="input" type="number" min={0} step={1000} value={f.compareAt ?? ''} onChange={(e) => set('compareAt', e.target.value ? Number(e.target.value) : null)} /></div>
          </div></div>

          <div className="panel"><div className="panel-h"><h2>Imágenes</h2><small className="muted">La primera es la portada</small></div><div className="panel-b">
            <div className="img-list">
              {images.map((src, i) => (
                <div className="img-item" key={src + i}>
                  {i === 0 && <span className="first">PORTADA</span>}
                  <img src={src} alt="" />
                  <div className="acts">
                    <button type="button" onClick={() => moveImg(i, -1)} title="Mover a la izquierda">←</button>
                    <button type="button" onClick={() => set('images', images.filter((_, j) => j !== i))} title="Quitar">✕</button>
                    <button type="button" onClick={() => moveImg(i, 1)} title="Mover a la derecha">→</button>
                  </div>
                </div>
              ))}
            </div>
            <label className="dropzone" style={{ marginTop: images.length ? 12 : 0 }}>
              {uploading ? 'Subiendo…' : '+ Subir imágenes (JPG, PNG, WEBP · máx. 6 MB)'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => onUpload(e.target.files)} />
            </label>
          </div></div>

          <div className="panel">
            <div className="panel-h"><h2>Variantes e inventario</h2><small className="muted">{variants.reduce((a, v) => a + (Number(v.stock) || 0), 0)} unidades</small></div>
            <div className="panel-b" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end', borderBottom: '1px solid var(--line)' }}>
              <div><label className="lbl">Color</label><input className="input" style={{ width: 120 }} value={gColor} onChange={(e) => setGColor(e.target.value)} /></div>
              <div><label className="lbl">Tono</label><input type="color" value={gHex} onChange={(e) => setGHex(e.target.value)} style={{ height: 40, width: 46, background: 'none', border: '1px solid var(--line2)', borderRadius: 6 }} /></div>
              <div><label className="lbl">Tallas</label><select className="input" value={gPreset} onChange={(e) => setGPreset(e.target.value)}>{Object.keys(PRESETS).map((k) => <option key={k}>{k}</option>)}</select></div>
              <div><label className="lbl">Stock c/u</label><input className="input" style={{ width: 80 }} type="number" min={0} value={gStock} onChange={(e) => setGStock(Number(e.target.value))} /></div>
              <button type="button" className="btn btn-sm" onClick={generate}>Agregar color</button>
            </div>
            <div className="tbl-wrap"><table className="tbl var-table">
              <thead><tr><th>Color</th><th>Tono</th><th>Talla</th><th>Stock</th><th></th></tr></thead>
              <tbody>
                {variants.length === 0 && <tr><td colSpan={5} className="muted">Usa “Agregar color” para crear las tallas.</td></tr>}
                {variants.map((v, i) => (
                  <tr key={v.id ?? i}>
                    <td><input value={v.color} onChange={(e) => setVar(i, 'color', e.target.value)} /></td>
                    <td><input type="color" value={v.colorHex} onChange={(e) => setVar(i, 'colorHex', e.target.value)} /></td>
                    <td style={{ width: 90 }}><input value={v.size} onChange={(e) => setVar(i, 'size', e.target.value)} /></td>
                    <td style={{ width: 100 }}><input type="number" min={0} value={v.stock} onChange={(e) => setVar(i, 'stock', Number(e.target.value))} className={v.stock === 0 ? 'zero' : ''} /></td>
                    <td style={{ width: 40 }}><button type="button" className="x" style={{ fontSize: 20 }} onClick={() => setVariants(variants.filter((_, j) => j !== i))} aria-label="Quitar">×</button></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>

        <div>
          <div className="panel"><div className="panel-h"><h2>Organización</h2></div><div className="panel-b" style={{ display: 'grid', gap: 14 }}>
            <label className="check"><input type="checkbox" checked={f.active} onChange={(e) => set('active', e.target.checked)} /> Visible en la tienda</label>
            <label className="check"><input type="checkbox" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} /> Destacado en inicio</label>
            <div><label className="lbl">Categoría</label><select className="input" value={f.category} onChange={(e) => set('category', e.target.value)}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}</select></div>
            <div><label className="lbl">Etiqueta (opcional)</label><input className="input" value={f.tag ?? ''} onChange={(e) => set('tag', e.target.value || null)} placeholder="Nuevo, Limitado, -20%…" /></div>
            <div><label className="lbl">URL</label><input className="input" value={f.slug ?? ''} onChange={(e) => set('slug', e.target.value)} placeholder="se genera del nombre" /><small className="muted" style={{ fontSize: 11 }}>/producto/{f.slug || 'nombre-del-producto'}</small></div>
            <div><label className="lbl">Orden (menor = primero)</label><input className="input" type="number" value={f.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} /></div>
          </div></div>
          {f.id && (
            <div className="panel"><div className="panel-b">
              <button type="button" className="btn btn-sm btn-block" style={{ borderColor: 'var(--accent2)', color: 'var(--accent2)' }}
                onClick={() => { if (confirm('¿Eliminar este producto? Si tiene pedidos, solo se ocultará.')) start(() => deleteProduct(f.id!)) }}>Eliminar producto</button>
            </div></div>
          )}
        </div>
      </div>
    </>
  )
}
