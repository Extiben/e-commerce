import Image from 'next/image'
import Link from 'next/link'
export const metadata = { title: 'El culto' }
export default function About() {
  return (
    <>
      <section className="banner" style={{ minHeight: 420 }}>
        <Image src="/brand/hero.jpg" alt="" fill sizes="100vw" priority />
        <div className="banner-inner"><div className="eyebrow">Sobre V01D</div><h2>El culto<br />del vacío</h2></div>
      </section>
      <div className="container"><div className="prose">
        <p>V01D nació en Medellín de una idea simple: el vacío no es la nada, es el espacio donde nace todo lo que todavía no existe. Es ahí donde crean los artistas, los músicos, los que se desvelan construyendo algo propio.</p>
        <h2>Lo que hacemos</h2>
        <p>Streetwear gótico de peso pesado. Siluetas oversized, bordados en hilo metalizado, prendas desmontables que te dan dos piezas en una. Todo fabricado en Colombia, en lotes pequeños.</p>
        <h2>Drops limitados</h2>
        <p>No hacemos temporadas infinitas. Cada colección se lanza en unidades contadas y nunca se repone. Si la tienes, es porque llegaste a tiempo.</p>
        <h2>La comunidad</h2>
        <p>No necesitas comprar nada para ser parte. Si eres de los que crean en lugar de criticar, ya perteneces al vacío.</p>
        <br /><Link href="/tienda" className="btn btn-red">Ver la colección</Link>
      </div></div>
    </>
  )
}
