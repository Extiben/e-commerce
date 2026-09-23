import type { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'
import { isDemoMode, isSandbox } from '@/lib/wompi'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default function CheckoutPage() {
  return <div className="container"><CheckoutForm mode={isDemoMode() ? 'demo' : isSandbox() ? 'sandbox' : 'live'} /></div>
}
