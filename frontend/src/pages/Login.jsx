import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.logo}>𝄞</div>
          <h2 style={s.title}>Welcome back</h2>
          <p style={s.sub}>Sign in to your Sonara account</p>
        </div>

        {error && <div style={s.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email address</label>
            <input style={s.input} type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <input style={s.input} type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account? <Link to="/register" style={s.a}>Join Sonara</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: '#0c0a07' },
  card: {
    background: '#161108', padding: '2.5rem', borderRadius: 16,
    width: '100%', maxWidth: 400, border: '1px solid #2a2016',
    boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
  },
  header: { textAlign: 'center', marginBottom: '1.75rem' },
  logo: { fontSize: '3rem', color: '#c8871e', marginBottom: '0.5rem', fontStyle: 'italic' },
  title: { color: '#f0e8d8', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' },
  sub: { color: '#5a4a38', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: '#8a7560', fontSize: '0.83rem', fontWeight: 500 },
  input: {
    padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #2a2016',
    background: '#0c0a07', color: '#f0e8d8', fontSize: '0.93rem', outline: 'none',
  },
  btn: {
    marginTop: '0.5rem', padding: '0.8rem',
    background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontWeight: 700, fontSize: '0.97rem',
  },
  error: {
    background: 'rgba(239,68,68,0.08)', color: '#f87171',
    padding: '0.7rem 1rem', borderRadius: 8, fontSize: '0.85rem',
    border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1rem',
  },
  footer: { textAlign: 'center', color: '#5a4a38', fontSize: '0.85rem', marginTop: '1.5rem' },
  a: { color: '#c8871e', fontWeight: 600 },
}
