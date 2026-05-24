import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/api'

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ color: '#8a7560', fontSize: '0.83rem', fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  )
}

const inputStyle = {
  padding: '0.7rem 1rem', borderRadius: 8, border: '1px solid #2a2016',
  background: '#0c0a07', color: '#f0e8d8', fontSize: '0.93rem', outline: 'none',
}

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ username: user.username, email: user.email })
  const [pw, setPw] = useState({ current_password: '', new_password: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })

  const flash = (setter, type, text, ms = 3500) => {
    setter({ type, text })
    setTimeout(() => setter({ type: '', text: '' }), ms)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    try {
      await api.put('/users/me', { username: form.username, email: form.email })
      await refreshUser()
      setEditMode(false)
      flash(setProfileMsg, 'success', 'Profile updated successfully')
    } catch (err) {
      flash(setProfileMsg, 'error', err.response?.data?.detail || 'Update failed')
    }
  }

  const handlePwSave = async (e) => {
    e.preventDefault()
    if (pw.new_password !== pw.confirm) { flash(setPwMsg, 'error', 'Passwords do not match'); return }
    if (pw.new_password.length < 6) { flash(setPwMsg, 'error', 'Password must be at least 6 characters'); return }
    try {
      await api.put('/users/me/password', { current_password: pw.current_password, new_password: pw.new_password })
      setPw({ current_password: '', new_password: '', confirm: '' })
      flash(setPwMsg, 'success', 'Password updated successfully')
    } catch (err) {
      flash(setPwMsg, 'error', err.response?.data?.detail || 'Update failed')
    }
  }

  return (
    <div style={s.page}>
      <h2 style={s.heading}>My Profile</h2>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={s.cardHead}>
            <div style={s.avatar}>{user.username[0].toUpperCase()}</div>
            <div>
              <p style={s.displayName}>{user.username}</p>
              <p style={s.displayEmail}>{user.email}</p>
            </div>
            <span style={{ ...s.roleBadge, ...(user.role === 'admin' ? s.adminBadge : {}) }}>
              {user.role}
            </span>
          </div>

          <div style={s.infoBlock}>
            <div style={s.infoRow}><span style={s.infoLabel}>Member since</span><span style={s.infoVal}>{new Date(user.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            <div style={s.infoRow}><span style={s.infoLabel}>Account type</span><span style={s.infoVal}>{user.role}</span></div>
          </div>

          {profileMsg.text && <Alert type={profileMsg.type}>{profileMsg.text}</Alert>}

          {editMode ? (
            <form onSubmit={handleProfileSave} style={s.form}>
              <Field label="Username">
                <input style={inputStyle} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required minLength={3} />
              </Field>
              <Field label="Email">
                <input style={inputStyle} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </Field>
              <div style={s.btns}>
                <button style={s.saveBtn} type="submit">Save Changes</button>
                <button style={s.cancelBtn} type="button" onClick={() => { setEditMode(false); setForm({ username: user.username, email: user.email }) }}>Cancel</button>
              </div>
            </form>
          ) : (
            <button style={s.editBtn} onClick={() => setEditMode(true)}>Edit Profile</button>
          )}
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>Change Password</h3>
          <p style={s.cardSub}>Choose a strong password with at least 6 characters.</p>
          {pwMsg.text && <Alert type={pwMsg.type}>{pwMsg.text}</Alert>}
          <form onSubmit={handlePwSave} style={s.form}>
            <Field label="Current Password">
              <input style={inputStyle} type="password" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} required placeholder="••••••••" />
            </Field>
            <Field label="New Password">
              <input style={inputStyle} type="password" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} required placeholder="Min. 6 characters" />
            </Field>
            <Field label="Confirm New Password">
              <input style={inputStyle} type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required placeholder="Repeat new password" />
            </Field>
            <button style={s.saveBtn} type="submit">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Alert({ type, children }) {
  const isSuccess = type === 'success'
  return (
    <div style={{
      padding: '0.65rem 1rem', borderRadius: 8, fontSize: '0.85rem',
      background: isSuccess ? 'rgba(200,135,30,0.1)' : 'rgba(239,68,68,0.08)',
      color: isSuccess ? '#c8871e' : '#f87171',
      border: `1px solid ${isSuccess ? 'rgba(200,135,30,0.25)' : 'rgba(239,68,68,0.2)'}`,
    }}>
      {children}
    </div>
  )
}

const s = {
  page: { padding: '2rem', maxWidth: 900, margin: '0 auto', background: '#0c0a07', minHeight: '100vh' },
  heading: { color: '#f0e8d8', fontWeight: 700, fontSize: '1.4rem', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' },
  card: {
    background: '#161108', borderRadius: 14, padding: '1.75rem',
    border: '1px solid #2a2016', display: 'flex', flexDirection: 'column', gap: '1rem',
  },
  cardHead: { display: 'flex', alignItems: 'center', gap: '1rem' },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg, #c8871e, #8a5e18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.3rem', fontWeight: 700, color: '#0c0a07',
  },
  displayName: { color: '#f0e8d8', fontWeight: 700, fontSize: '1rem' },
  displayEmail: { color: '#5a4a38', fontSize: '0.83rem', marginTop: 2 },
  roleBadge: {
    marginLeft: 'auto', padding: '0.2rem 0.75rem', borderRadius: 99,
    background: '#1e1810', color: '#8a7560', fontSize: '0.75rem', fontWeight: 600,
    border: '1px solid #2a2016',
  },
  adminBadge: { background: 'rgba(200,135,30,0.12)', color: '#c8871e', border: '1px solid rgba(200,135,30,0.25)' },
  infoBlock: { background: '#0c0a07', borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2016' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '0.65rem 1rem',
    borderBottom: '1px solid #1e1810',
  },
  infoLabel: { color: '#5a4a38', fontSize: '0.85rem' },
  infoVal: { color: '#8a7560', fontSize: '0.85rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.85rem' },
  btns: { display: 'flex', gap: '0.75rem' },
  saveBtn: {
    flex: 1, padding: '0.72rem', background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
  },
  cancelBtn: {
    padding: '0.72rem 1.2rem', background: 'transparent', color: '#5a4a38',
    border: '1px solid #2a2016', borderRadius: 8, cursor: 'pointer',
  },
  editBtn: {
    padding: '0.7rem', background: '#1e1810', color: '#8a7560',
    border: '1px solid #2a2016', borderRadius: 8, cursor: 'pointer', fontWeight: 500,
  },
  cardTitle: { color: '#f0e8d8', fontWeight: 700, fontSize: '1rem' },
  cardSub: { color: '#5a4a38', fontSize: '0.83rem', marginTop: -4 },
}
