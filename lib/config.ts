export const STORE = {
  name: 'V01D',
  tagline: 'Gothic streetwear desde el vacío',
  city: 'Medellín',
  email: 'hola@v01d.co',
  whatsapp: '573000000000',
  instagram: 'https://instagram.com/v01d',
  tiktok: 'https://tiktok.com/@v01d',
  freeShippingFrom: 250_000,
  shippingMedellin: 10_000,
  shippingNational: 18_000,
}

export const CATEGORIES = [
  { slug: 'hoodies', label: 'Hoodies' },
  { slug: 'camisetas', label: 'Camisetas' },
  { slug: 'pantalones', label: 'Pantalones' },
  { slug: 'chaquetas', label: 'Chaquetas' },
  { slug: 'accesorios', label: 'Accesorios' },
] as const

export const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única', '6', '7', '8', '9', '10']

export const DEPARTAMENTOS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés y Providencia','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada',
]

export function shippingFor(subtotal: number, city: string) {
  if (subtotal <= 0 || subtotal >= STORE.freeShippingFrom) return 0
  const c = city.trim().toLowerCase()
  const metro = ['medellín', 'medellin', 'envigado', 'itagüí', 'itagui', 'sabaneta', 'bello', 'la estrella']
  return metro.includes(c) ? STORE.shippingMedellin : STORE.shippingNational
}

export const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendiente de pago', color: '#b08900' },
  PAID: { label: 'Pagado', color: '#1f9d55' },
  SHIPPED: { label: 'Enviado', color: '#3b82f6' },
  DELIVERED: { label: 'Entregado', color: '#8b5cf6' },
  DECLINED: { label: 'Rechazado', color: '#c81e1e' },
  VOIDED: { label: 'Anulado', color: '#6b7280' },
  ERROR: { label: 'Error', color: '#c81e1e' },
  CANCELLED: { label: 'Cancelado', color: '#6b7280' },
}
