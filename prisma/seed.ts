import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const APPAREL = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const C = { Negro: '#111113', Hueso: '#e9e4da', Sangre: '#5c0712', Carbón: '#2b2b2e', Plata: '#c9c9cf' }

type Seed = {
  slug: string; name: string; category: string; price: number; compareAt?: number; tag?: string; featured?: boolean
  images: string[]; description: string; details: string; colors: (keyof typeof C)[]; sizes?: string[]; soldOut?: string[]
}

const products: Seed[] = [
  { slug: 'void-hoodie', name: 'Void Hoodie', category: 'hoodies', price: 289000, tag: 'Nuevo', featured: true,
    images: ['/products/void-hoodie.jpg'], colors: ['Negro'], soldOut: ['XS'],
    description: 'Hoodie oversized de 450 GSM con araña bordada en hilo plata. Capucha de doble capa y puños de rib grueso. La pieza insignia de V01D.',
    details: '100% algodón french terry 450 GSM · Bordado metalizado · Fit oversized con hombro caído · Hecho en Medellín' },
  { slug: 'detach-cargo', name: 'Detach Cargo', category: 'pantalones', price: 319000, compareAt: 369000, tag: 'Desmontable', featured: true,
    images: ['/products/detach-cargo.jpg'], colors: ['Negro'],
    description: 'Cargo baggy que se convierte en short gracias a su cremallera oculta a la altura de la rodilla. Dos prendas en una sola pieza.',
    details: 'Twill de algodón 320 GSM · Cremalleras YKK · 6 bolsillos · Araña bordada en la rodilla' },
  { slug: 'crucifix-tee', name: 'Crucifix Tee', category: 'camisetas', price: 139000, featured: true,
    images: ['/products/crucifix-tee.jpg'], colors: ['Negro'], soldOut: ['XXL'],
    description: 'Camiseta boxy de algodón pesado con cruz gótica en tinta puff desgastada. Cuello grueso y hombro caído.',
    details: '100% algodón 260 GSM · Estampado puff · Lavado vintage' },
  { slug: 'veil-zip-jacket', name: 'Veil Zip Jacket', category: 'chaquetas', price: 459000, tag: 'Limitado', featured: true,
    images: ['/products/veil-jacket.jpg'], colors: ['Negro'],
    description: 'Chaqueta con capucha, cierre metálico bidireccional y parche de araña en el pecho. Herrajes en plata envejecida.',
    details: 'Algodón 420 GSM · Cierre metálico bidireccional · Forro interior satinado' },
  { slug: 'web-tee', name: 'Web Tee', category: 'camisetas', price: 129000, compareAt: 159000, tag: '-20%',
    images: ['/products/bone-tee.jpg'], colors: ['Hueso'],
    description: 'Camiseta color hueso con telaraña serigrafiada en el pecho. Lavado vintage que la hace sentir usada desde el primer día.',
    details: '100% algodón 240 GSM · Serigrafía a base de agua' },
  { slug: 'blood-web-hoodie', name: 'Blood Web Hoodie', category: 'hoodies', price: 299000,
    images: ['/products/blood-hoodie.jpg'], colors: ['Sangre'], soldOut: ['M'],
    description: 'Hoodie color sangre con telaraña gigante estampada en la espalda. Bolsillo canguro y costuras deshilachadas a propósito.',
    details: '100% algodón french terry 420 GSM · Estampado en espalda' },
  { slug: 'spider-chain', name: 'Spider Chain', category: 'accesorios', price: 119000, tag: 'Nuevo',
    images: ['/products/spider-chain.jpg'], colors: ['Plata'], sizes: ['Única'],
    description: 'Cadena de acero inoxidable 316L con dije de araña fundido. Resistente al agua, no se oxida. 55 cm.',
    details: 'Acero inoxidable 316L · Hipoalergénica · Largo 55 cm' },
  { slug: 'coven-cap', name: 'Coven Cap', category: 'accesorios', price: 99000,
    images: ['/products/coven-cap.jpg'], colors: ['Negro'], sizes: ['Única'],
    description: 'Gorra de seis paneles con araña bordada en 3D. Visera curva y cierre metálico ajustable.',
    details: 'Algodón twill · Bordado 3D · Talla ajustable' },
]

async function main() {
  for (const [i, p] of products.entries()) {
    const sizes = p.sizes ?? APPAREL
    const data = {
      name: p.name, category: p.category, price: p.price, compareAt: p.compareAt ?? null, tag: p.tag ?? null,
      featured: !!p.featured, images: JSON.stringify(p.images), description: p.description, details: p.details, sortOrder: i,
    }
    const prod = await prisma.product.upsert({ where: { slug: p.slug }, update: data, create: { slug: p.slug, ...data } })
    for (const color of p.colors) for (const size of sizes) {
      const sku = `${p.slug}-${color}-${size}`.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      const stock = p.soldOut?.includes(size) ? 0 : 5 + ((i * 7 + size.length * 3) % 15)
      await prisma.variant.upsert({
        where: { sku }, update: {},
        create: { productId: prod.id, color, colorHex: C[color], size, stock, sku },
      })
    }
  }
  await prisma.discountCode.upsert({ where: { code: 'V01D10' }, update: {}, create: { code: 'V01D10', percent: 10 } })
  console.log(`✓ ${products.length} productos y código V01D10 creados`)
}

main().finally(() => prisma.$disconnect())
