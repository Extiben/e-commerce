export const metadata = { title: 'Guía de tallas' }
const rows = [['XS', 64, 54, 68], ['S', 67, 57, 70], ['M', 70, 60, 72], ['L', 73, 63, 74], ['XL', 76, 66, 76], ['XXL', 79, 69, 78]]
export default function Sizes() {
  return (
    <div className="container">
      <div className="page-head"><div className="eyebrow">Ayuda</div><h1>Guía de tallas</h1></div>
      <div className="prose">
        <p>Nuestras prendas tienen <b>fit oversized</b>. Si prefieres un fit más ajustado, pide una talla menos de la que usas normalmente.</p>
        <h2>Hoodies y camisetas (cm)</h2>
        <table className="table"><thead><tr><th>Talla</th><th>Ancho pecho</th><th>Hombro</th><th>Largo</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
        <h2>Pantalones (cm)</h2>
        <table className="table"><thead><tr><th>Talla</th><th>Cintura</th><th>Cadera</th><th>Largo</th></tr></thead>
          <tbody>{[['XS', 70, 100, 100], ['S', 74, 104, 102], ['M', 78, 108, 104], ['L', 82, 112, 106], ['XL', 86, 116, 108], ['XXL', 90, 120, 110]].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody></table>
        <p>Medidas tomadas con la prenda extendida sobre una superficie plana. Pueden variar ±2 cm.</p>
      </div>
    </div>
  )
}
