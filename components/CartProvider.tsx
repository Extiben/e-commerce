'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type CartItem = {
  variantId: string; productId: string; slug: string; name: string
  color: string; size: string; price: number; image: string; qty: number; max: number
}

type Ctx = {
  items: CartItem[]; count: number; subtotal: number; open: boolean; ready: boolean
  setOpen: (v: boolean) => void
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void
  update: (variantId: string, qty: number) => void
  remove: (variantId: string) => void
  clear: () => void
  toast: (msg: string) => void
}

const CartCtx = createContext<Ctx | null>(null)
const KEY = 'v01d_cart_v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [open, setOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch {}
    setReady(true)
  }, [])
  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)) }, [items, ready])
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : '' }, [open])

  const toast = useCallback((m: string) => {
    setMsg(m); setTimeout(() => setMsg((cur) => (cur === m ? null : cur)), 2600)
  }, [])

  const add: Ctx['add'] = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const ex = prev.find((i) => i.variantId === item.variantId)
      if (ex) return prev.map((i) => i.variantId === item.variantId ? { ...i, max: item.max, qty: Math.min(item.max, i.qty + qty) } : i)
      return [...prev, { ...item, qty: Math.min(item.max, qty) }]
    })
  }, [])
  const update = useCallback((id: string, qty: number) =>
    setItems((p) => qty <= 0 ? p.filter((i) => i.variantId !== id) : p.map((i) => i.variantId === id ? { ...i, qty: Math.min(i.max, qty) } : i)), [])
  const remove = useCallback((id: string) => setItems((p) => p.filter((i) => i.variantId !== id)), [])
  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<Ctx>(() => ({
    items, open, ready, setOpen, add, update, remove, clear, toast,
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
  }), [items, open, ready, add, update, remove, clear, toast])

  return (
    <CartCtx.Provider value={value}>
      {children}
      <div className={`toast ${msg ? 'show' : ''}`} role="status">{msg}</div>
    </CartCtx.Provider>
  )
}

export function useCart() {
  const c = useContext(CartCtx)
  if (!c) throw new Error('useCart fuera de CartProvider')
  return c
}
