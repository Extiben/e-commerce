import type { Metadata, Viewport } from 'next'
import { Cinzel, Inter, UnifrakturCook } from 'next/font/google'
import './globals.css'

const goth = UnifrakturCook({ weight: '700', subsets: ['latin'], variable: '--font-goth', display: 'swap' })
const serif = Cinzel({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-serif', display: 'swap' })
const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'V01D — Gothic Streetwear', template: '%s · V01D' },
  description: 'Gothic streetwear hecho en Medellín. Hoodies oversized, cargos desmontables y accesorios en acero. Drops limitados.',
  openGraph: { siteName: 'V01D', locale: 'es_CO', type: 'website', images: ['/brand/hero.jpg'] },
}
export const viewport: Viewport = { themeColor: '#070707' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${goth.variable} ${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  )
}
