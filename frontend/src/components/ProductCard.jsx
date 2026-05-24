import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/api'
import { useAuth } from '../context/AuthContext'

const PLACEHOLDER = 'https://placehold.co/300x200/161108/5a4a38?text=No+Image'

export default function ProductCard({ product, onEdit, onDelete, isAdmin }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [errMsg, setErrMsg] = useState('')

  const addToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 })
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (!detail) return
      setErrMsg(detail)
      setTimeout(() => setErrMsg(''), 2500)
    } finally {
      setAdding(false)
    }
  }

  const outOfStock = product.stock === 0

  return (
    <div style={s.card}>
      <div style={s.imgWrap}>
        <img
          src={product.image_url || PLACEHOLDER}
          alt={product.name}
          style={s.img}
          onError={(e) => { e.target.src = PLACEHOLDER }}
        />
        <span style={s.categoryPill}>{product.category}</span>
      </div>

      <div style={s.body}>
        <h3 style={s.name}>{product.name}</h3>
        <p style={s.desc}>{product.description}</p>

        <div style={s.meta}>
          <span style={s.price}>${product.price.toFixed(2)}</span>
          <span style={{ ...s.stock, color: outOfStock ? '#f87171' : '#5a4a38' }}>
            {outOfStock ? 'Out of stock' : `${product.stock} left`}
          </span>
        </div>

        {isAdmin ? (
          <div style={s.row}>
            <button style={s.editBtn} onClick={() => onEdit(product)}>Edit</button>
            <button style={s.deleteBtn} onClick={() => onDelete(product.id)}>Delete</button>
          </div>
        ) : (
          <button
            style={{
              ...s.addBtn,
              ...(added ? s.addedBtn : {}),
              ...(outOfStock ? s.disabledBtn : {}),
            }}
            onClick={addToCart}
            disabled={adding || outOfStock}
          >
            {errMsg
              ? `⚠ ${errMsg}`
              : adding ? 'Adding…'
              : added ? '✓ Added to cart'
              : outOfStock ? 'Out of Stock'
              : 'Add to Cart'}
          </button>
        )}
      </div>
    </div>
  )
}

const s = {
  card: {
    background: '#161108',
    borderRadius: 14,
    overflow: 'hidden',
    border: '1px solid #2a2016',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default',
  },
  imgWrap: { position: 'relative', overflow: 'hidden', height: 180 },
  img: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' },
  categoryPill: {
    position: 'absolute', top: 10, left: 10,
    background: 'rgba(12,10,7,0.75)', backdropFilter: 'blur(6px)',
    color: '#8a7560', fontSize: '0.68rem', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.08em',
    padding: '3px 10px', borderRadius: 99,
  },
  body: { padding: '1rem 1.1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 },
  name: { fontSize: '0.97rem', fontWeight: 600, color: '#f0e8d8', lineHeight: 1.3 },
  desc: {
    fontSize: '0.82rem', color: '#5a4a38', lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  meta: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 2 },
  price: { fontSize: '1.15rem', fontWeight: 700, color: '#c8871e' },
  stock: { fontSize: '0.78rem' },
  addBtn: {
    width: '100%', padding: '0.6rem',
    background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 8,
    cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem',
    transition: 'background 0.2s',
    marginTop: 4,
  },
  addedBtn: { background: '#059669', color: '#fff' },
  disabledBtn: { background: '#2a2016', color: '#5a4a38', cursor: 'not-allowed' },
  row: { display: 'flex', gap: 8, marginTop: 4 },
  editBtn: {
    flex: 1, padding: '0.55rem', background: '#3b82f6', color: '#fff',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
  },
  deleteBtn: {
    flex: 1, padding: '0.55rem', background: '#7f1d1d', color: '#fca5a5',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
  },
}
