import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/api'

const PLACEHOLDER = 'https://placehold.co/80x80/161108/5a4a38?text=?'

export default function Cart() {
  const [cart, setCart] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart/')
      setCart(data)
    } catch {
      setError('Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  const updateQty = async (itemId, qty) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity: qty })
      fetchCart()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not update quantity')
    }
  }

  const remove = async (itemId) => {
    await api.delete(`/cart/${itemId}`)
    fetchCart()
  }

  const clearCart = async () => {
    if (!confirm('Remove all items from your cart?')) return
    await api.delete('/cart')
    fetchCart()
  }

  if (loading) return <div style={s.center}><span style={s.spinner}>Loading…</span></div>
  if (error) return <div style={s.center}><p style={{ color: '#f87171' }}>{error}</p></div>

  if (cart.items.length === 0) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIcon}>🎸</div>
        <h2 style={{ color: '#f0e8d8', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: '#5a4a38' }}>Find your next instrument</p>
        <Link to="/" style={s.shopBtn}>Browse Gear</Link>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.heading}>
        <h2 style={s.title}>Your Cart</h2>
        <span style={s.count}>{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</span>
      </div>

      <div style={s.layout}>
        <div style={s.itemList}>
          {cart.items.map((item) => (
            <div key={item.id} style={s.item}>
              <img
                src={item.product_image || PLACEHOLDER}
                alt={item.product_name}
                style={s.img}
                onError={(e) => { e.target.src = PLACEHOLDER }}
              />
              <div style={s.info}>
                <p style={s.name}>{item.product_name}</p>
                <p style={s.unitPrice}>${item.product_price.toFixed(2)} each</p>
              </div>
              <div style={s.qtyWrap}>
                <button
                  style={s.qtyBtn}
                  onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : remove(item.id)}
                >−</button>
                <span style={s.qty}>{item.quantity}</span>
                <button style={s.qtyBtn} onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
              </div>
              <span style={s.subtotal}>${item.subtotal.toFixed(2)}</span>
              <button style={s.removeBtn} onClick={() => remove(item.id)} title="Remove">✕</button>
            </div>
          ))}
        </div>

        <div style={s.summary}>
          <h3 style={s.summaryTitle}>Order Summary</h3>
          <div style={s.summaryRow}><span style={s.summaryLabel}>Subtotal</span><span style={s.summaryVal}>${cart.total.toFixed(2)}</span></div>
          <div style={s.summaryRow}><span style={s.summaryLabel}>Shipping</span><span style={{ color: '#4ade80', fontWeight: 600 }}>Free</span></div>
          <div style={s.summaryRow}><span style={s.summaryLabel}>Tax</span><span style={s.summaryVal}>$0.00</span></div>
          <div style={s.divider} />
          <div style={{ ...s.summaryRow, fontWeight: 700 }}>
            <span style={{ color: '#f0e8d8', fontSize: '1rem' }}>Total</span>
            <span style={{ color: '#c8871e', fontSize: '1.2rem' }}>${cart.total.toFixed(2)}</span>
          </div>
          <button style={s.checkoutBtn}>Proceed to Checkout</button>
          <button style={s.clearBtn} onClick={clearCart}>Clear Cart</button>
        </div>
      </div>
    </div>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: 1050, margin: '0 auto', background: '#0c0a07', minHeight: '100vh' },
  heading: { display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.5rem' },
  title: { color: '#f0e8d8', fontWeight: 700, fontSize: '1.4rem' },
  count: { color: '#5a4a38', fontSize: '0.9rem' },
  layout: { display: 'flex', gap: '1.75rem', flexWrap: 'wrap', alignItems: 'flex-start' },
  itemList: { flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  item: {
    background: '#161108', borderRadius: 12, padding: '1rem 1.2rem',
    display: 'flex', alignItems: 'center', gap: '1rem',
    border: '1px solid #2a2016',
  },
  img: { width: 72, height: 72, objectFit: 'cover', borderRadius: 8, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  name: { color: '#f0e8d8', fontWeight: 600, fontSize: '0.93rem', marginBottom: 2 },
  unitPrice: { color: '#5a4a38', fontSize: '0.8rem' },
  qtyWrap: { display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 8, border: '1px solid #2a2016',
    background: '#221a12', color: '#f0e8d8', cursor: 'pointer', fontSize: '1rem', fontWeight: 600,
  },
  qty: { color: '#f0e8d8', minWidth: 22, textAlign: 'center', fontWeight: 600 },
  subtotal: { color: '#c8871e', fontWeight: 700, minWidth: 64, textAlign: 'right', flexShrink: 0 },
  removeBtn: {
    background: 'none', border: 'none', color: '#3a2a1a',
    cursor: 'pointer', fontSize: '0.9rem', padding: '0.2rem 0.4rem',
    borderRadius: 4, flexShrink: 0,
  },
  summary: {
    width: 290, background: '#161108', borderRadius: 14, padding: '1.5rem',
    border: '1px solid #2a2016', display: 'flex', flexDirection: 'column', gap: '0.6rem',
  },
  summaryTitle: { color: '#f0e8d8', fontWeight: 700, marginBottom: '0.25rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#5a4a38', fontSize: '0.9rem' },
  summaryVal: { color: '#8a7560', fontSize: '0.9rem' },
  divider: { border: 'none', borderTop: '1px solid #2a2016', margin: '0.25rem 0' },
  checkoutBtn: {
    width: '100%', padding: '0.8rem', background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem',
    marginTop: '0.5rem',
  },
  clearBtn: {
    width: '100%', padding: '0.65rem', background: 'transparent', color: '#5a4a38',
    border: '1px solid #2a2016', borderRadius: 10, cursor: 'pointer', fontSize: '0.85rem',
  },
  center: { display: 'flex', justifyContent: 'center', padding: '4rem', background: '#0c0a07', minHeight: '100vh' },
  spinner: { color: '#5a4a38' },
  empty: {
    textAlign: 'center', padding: '5rem 2rem', background: '#0c0a07', minHeight: '100vh',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
  },
  emptyIcon: { fontSize: '4rem', marginBottom: '0.5rem' },
  shopBtn: {
    marginTop: '0.5rem', padding: '0.75rem 2rem',
    background: '#c8871e', color: '#0c0a07', borderRadius: 10, fontWeight: 700,
  },
}
