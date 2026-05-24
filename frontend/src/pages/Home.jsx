// Authors: Kunj Vania, Atharva
import { useState, useEffect, useCallback } from 'react'

const SEARCH_DEBOUNCE_MS = 300
import api from '../api/api'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category) params.category = category
      const { data } = await api.get('/products', { params })
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, category])

  useEffect(() => {
    const timer = setTimeout(fetchProducts, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [fetchProducts])

  return (
    <div style={s.page}>
      {/* Hero */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <p style={s.eyebrow}>🎸 Handpicked guitars &amp; gear</p>
          <h1 style={s.heroTitle}>Find your sound.</h1>
          <p style={s.heroSub}>Premium instruments from the world's top makers, curated for players of every level.</p>
          <div style={s.searchBar}>
            <span style={s.searchIcon}>⌕</span>
            <input
              style={s.searchInput}
              type="text"
              placeholder="Search guitars, amps, pedals…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Filter row */}
      <div style={s.filterRow}>
        <span style={s.resultCount}>
          {loading ? 'Loading…' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
          {search && <span style={{ color: '#c8871e' }}> for "{search}"</span>}
        </span>
        <div style={s.filterRight}>
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              style={{ ...s.filterChip, ...(category === c ? s.filterChipActive : {}) }}
              onClick={() => setCategory(c)}
            >
              {c || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={s.content}>
        {loading ? (
          <div style={s.grid}>
            {[...Array(8)].map((_, i) => <div key={i} style={s.skeleton} />)}
          </div>
        ) : products.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: '3rem' }}>🎸</span>
            <p style={{ color: '#5a4a38', marginTop: '0.5rem' }}>No instruments found</p>
          </div>
        ) : (
          <div style={s.grid}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: '#0c0a07' },
  hero: {
    position: 'relative', overflow: 'hidden',
    background: [
      'linear-gradient(to bottom, rgba(12,10,7,0.88) 0%, rgba(12,10,7,0.72) 50%, rgba(12,10,7,0.88) 100%)',
      'url(https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=1400&auto=format&fit=crop) center/cover no-repeat',
    ].join(', '),
    padding: '4.5rem 2rem 3rem',
    textAlign: 'center',
    borderBottom: '1px solid #2a2016',
  },
  heroInner: { maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 },
  eyebrow: {
    display: 'inline-block',
    background: 'rgba(200,135,30,0.12)', color: '#c8871e',
    padding: '0.3rem 1.1rem', borderRadius: 99, fontSize: '0.8rem', fontWeight: 600,
    marginBottom: '1.25rem', border: '1px solid rgba(200,135,30,0.25)',
    letterSpacing: '0.04em',
  },
  heroTitle: {
    color: '#f0e8d8', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
    fontWeight: 800, lineHeight: 1.1, marginBottom: '0.9rem',
    letterSpacing: '-0.02em', fontStyle: 'italic',
  },
  heroSub: {
    color: '#8a7560', fontSize: '1rem', lineHeight: 1.6,
    marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem',
  },
  searchBar: {
    display: 'flex', alignItems: 'center',
    background: '#161108', borderRadius: 12,
    border: '1px solid #2a2016', padding: '0 1.1rem',
    gap: '0.5rem', maxWidth: 520, margin: '0 auto',
    boxShadow: '0 0 0 0 transparent',
    transition: 'border-color 0.2s',
  },
  searchIcon: { fontSize: '1.1rem', color: '#5a4a38', flexShrink: 0 },
  searchInput: {
    flex: 1, padding: '0.9rem 0', background: 'transparent',
    border: 'none', color: '#f0e8d8', fontSize: '0.95rem', outline: 'none',
  },
  clearBtn: {
    background: 'none', border: 'none', color: '#5a4a38',
    cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem',
  },
  filterRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '1rem 2rem', flexWrap: 'wrap', gap: '0.75rem',
    maxWidth: 1200, margin: '0 auto',
  },
  resultCount: { color: '#5a4a38', fontSize: '0.88rem' },
  filterRight: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  filterChip: {
    padding: '0.3rem 0.9rem', borderRadius: 99, border: '1px solid #2a2016',
    background: 'transparent', color: '#5a4a38', cursor: 'pointer',
    fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.15s',
  },
  filterChipActive: {
    background: '#c8871e', borderColor: '#c8871e', color: '#0c0a07', fontWeight: 700,
  },
  content: { padding: '0 2rem 3rem', maxWidth: 1200, margin: '0 auto' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '1.25rem',
  },
  skeleton: {
    height: 340, borderRadius: 14,
    background: 'linear-gradient(90deg, #161108 25%, #1e1810 50%, #161108 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  },
  empty: { textAlign: 'center', padding: '5rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' },
}
