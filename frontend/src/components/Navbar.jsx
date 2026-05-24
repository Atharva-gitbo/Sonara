import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../api/api'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (!user) { setCartCount(0); return }
    api.get('/cart/').then(({ data }) => setCartCount(data.items.length)).catch(() => {})
  }, [user, location.pathname])

  const handleLogout = () => { logout(); navigate('/login') }
  const isActive = (path) => location.pathname === path

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>
        <span style={s.brandIcon}>𝄞</span>
        <span style={s.brandName}>Sonara</span>
      </Link>

      <div style={s.links}>
        <Link to="/" style={{ ...s.link, ...(isActive('/') ? s.activeLink : {}) }}>Shop</Link>
        {user && (
          <>
            <Link to="/cart" style={{ ...s.link, ...(isActive('/cart') ? s.activeLink : {}) }}>
              Cart
              {cartCount > 0 && <span style={s.badge}>{cartCount}</span>}
            </Link>
            <Link to="/profile" style={{ ...s.link, ...(isActive('/profile') ? s.activeLink : {}) }}>
              Profile
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ ...s.link, ...(isActive('/admin') ? s.activeLink : {}), ...s.adminLink }}>
                Admin
              </Link>
            )}
            <div style={s.userChip}>
              <span style={s.avatar}>{user.username[0].toUpperCase()}</span>
              <span style={s.username}>{user.username}</span>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </>
        )}
        {!user && (
          <>
            <Link to="/login" style={{ ...s.link, ...(isActive('/login') ? s.activeLink : {}) }}>Login</Link>
            <Link to="/register" style={s.registerBtn}>Join</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const s = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2rem', height: 62,
    background: 'rgba(12, 10, 7, 0.96)',
    backdropFilter: 'blur(14px)',
    borderBottom: '1px solid #2a2016',
    position: 'sticky', top: 0, zIndex: 100,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontSize: '1.25rem', fontWeight: 700, color: '#f0e8d8',
    letterSpacing: '-0.01em',
  },
  brandIcon: { fontSize: '1.5rem', color: '#c8871e', lineHeight: 1 },
  brandName: { fontStyle: 'italic', letterSpacing: '0.04em' },
  links: { display: 'flex', alignItems: 'center', gap: '0.25rem' },
  link: {
    padding: '0.4rem 0.8rem', borderRadius: 8,
    color: '#8a7560', fontSize: '0.9rem', fontWeight: 500,
    transition: 'color 0.15s, background 0.15s', display: 'flex', alignItems: 'center', gap: 6,
  },
  activeLink: { color: '#f0e8d8', background: '#221a12' },
  adminLink: { color: '#c8871e' },
  badge: {
    background: '#c8871e', color: '#0c0a07', borderRadius: 99,
    padding: '0 6px', fontSize: '0.7rem', fontWeight: 700, minWidth: 18, textAlign: 'center',
  },
  userChip: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    padding: '0.3rem 0.75rem', background: '#1e1810', borderRadius: 99, marginLeft: '0.5rem',
    border: '1px solid #2a2016',
  },
  avatar: {
    width: 24, height: 24, borderRadius: '50%',
    background: 'linear-gradient(135deg, #c8871e, #8a5e18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '0.75rem', fontWeight: 700, color: '#0c0a07',
  },
  username: { color: '#c8b89a', fontSize: '0.85rem', fontWeight: 500 },
  logoutBtn: {
    padding: '0.4rem 0.9rem', background: 'transparent', color: '#5a4a38',
    border: '1px solid #2a2016', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem',
    marginLeft: '0.25rem',
  },
  registerBtn: {
    padding: '0.45rem 1.1rem', background: '#c8871e', color: '#0c0a07',
    borderRadius: 8, fontSize: '0.88rem', fontWeight: 700, marginLeft: '0.5rem',
  },
}
