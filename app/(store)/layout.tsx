import { CartProvider } from '@/components/CartProvider'
import CartDrawer from '@/components/CartDrawer'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
