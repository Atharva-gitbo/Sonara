// Author: Kunj Vania
import { useState, useEffect } from 'react'
import api from '../api/api'

const TABS = ['Products', 'Users', 'Carts']
const FLASH_DURATION_MS = 3000

export default function Admin() {
  const [tab, setTab] = useState('Products')
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [carts, setCarts] = useState([])
  const [productForm, setProductForm] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), FLASH_DURATION_MS) }

  useEffect(() => { if (tab === 'Products') fetchProducts() }, [tab])
  useEffect(() => { if (tab === 'Users') fetchUsers() }, [tab])
  useEffect(() => { if (tab === 'Carts') fetchCarts() }, [tab])

  const fetchProducts = async () => {
    const { data } = await api.get('/products')
    setProducts(data)
  }
  const fetchUsers = async () => {
    const { data } = await api.get('/users')
    setUsers(data)
  }
  const fetchCarts = async () => {
    const { data } = await api.get('/cart/all')
    setCarts(data)
  }

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchProducts()
    flash('Product deleted')
  }

  const saveProduct = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const body = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        category: productForm.category,
        image_url: productForm.image_url || '',
      }
      if (productForm.id) {
        await api.put(`/products/${productForm.id}`, body)
        flash('Product updated')
      } else {
        await api.post('/products', body)
        flash('Product created')
      }
      setProductForm(null)
      fetchProducts()
    } catch (err) {
      flash(err.response?.data?.detail || 'Save failed')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user and their cart?')) return
    await api.delete(`/users/${id}`)
    fetchUsers()
    flash('User deleted')
  }

  const changeRole = async (id, role) => {
    await api.put(`/users/${id}/role?role=${role}`)
    fetchUsers()
  }

  const importFromReverb = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/reverb/import?q=guitar&per_page=20')
      flash(`Imported ${data.inserted} guitars from Reverb`)
      fetchProducts()
    } catch (err) {
      flash(err.response?.data?.detail || 'Reverb import failed — check your API key in .env')
    } finally {
      setLoading(false)
    }
  }

  const emptyForm = { name: '', description: '', price: '', stock: '', category: '', image_url: '' }

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Admin Dashboard</h2>
      {msg && <div style={styles.flash}>{msg}</div>}

      <div style={styles.tabs}>
        {TABS.map((t) => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.activeTab : {}) }} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === 'Products' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button style={styles.addBtn} onClick={() => setProductForm({ ...emptyForm })}>+ Add Product</button>
            <button style={styles.reverbBtn} onClick={importFromReverb} disabled={loading}>
              {loading ? 'Importing…' : '🎸 Import from Reverb'}
            </button>
          </div>

          {productForm && (
            <div style={styles.modal}>
              <div style={styles.modalBox}>
                <h3 style={{ color: '#f0e8d8', marginTop: 0 }}>{productForm.id ? 'Edit Product' : 'New Product'}</h3>
                <form onSubmit={saveProduct} style={styles.form}>
                  {[
                    { label: 'Name', key: 'name', required: true },
                    { label: 'Category', key: 'category', required: true },
                    { label: 'Price ($)', key: 'price', type: 'number', required: true },
                    { label: 'Stock', key: 'stock', type: 'number', required: true },
                    { label: 'Image URL', key: 'image_url' },
                  ].map(({ label, key, type = 'text', required }) => (
                    <div key={key}>
                      <label style={styles.label}>{label}</label>
                      <input
                        style={styles.input}
                        type={type}
                        value={productForm[key]}
                        onChange={(e) => setProductForm({ ...productForm, [key]: e.target.value })}
                        required={required}
                        step={key === 'price' ? '0.01' : undefined}
                        min={key === 'price' || key === 'stock' ? '0' : undefined}
                      />
                    </div>
                  ))}
                  <div>
                    <label style={styles.label}>Description</label>
                    <textarea
                      style={{ ...styles.input, height: 80, resize: 'vertical' }}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      required
                    />
                  </div>
                  <div style={styles.modalBtns}>
                    <button style={styles.saveBtn} type="submit" disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
                    <button style={styles.cancelBtn} type="button" onClick={() => setProductForm(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <table style={styles.table}>
            <thead><tr style={styles.thead}>
              {['Name', 'Category', 'Price', 'Stock', 'Actions'].map((h) => <th key={h} style={styles.th}>{h}</th>)}
            </tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}>{p.category}</td>
                  <td style={styles.td}>${p.price.toFixed(2)}</td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtnSm} onClick={() => setProductForm({ ...p })}>Edit</button>
                    <button style={styles.delBtnSm} onClick={() => deleteProduct(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Users' && (
        <table style={styles.table}>
          <thead><tr style={styles.thead}>
            {['Username', 'Email', 'Role', 'Joined', 'Actions'].map((h) => <th key={h} style={styles.th}>{h}</th>)}
          </tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={styles.tr}>
                <td style={styles.td}>{u.username}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <select style={styles.roleSelect} value={u.role} onChange={(e) => changeRole(u.id, e.target.value)}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button style={styles.delBtnSm} onClick={() => deleteUser(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'Carts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {carts.length === 0 && <p style={{ color: '#5a4a38' }}>No active carts.</p>}
          {carts.map((cart) => (
            <div key={cart.user_id} style={styles.cartCard}>
              <div style={styles.cartHeader}>
                <span style={{ color: '#f0e8d8', fontWeight: 600 }}>{cart.username}</span>
                <span style={{ color: '#5a4a38', fontSize: '0.85rem' }}>{cart.email}</span>
                <span style={{ color: '#c8871e', fontWeight: 700 }}>Total: ${cart.total.toFixed(2)}</span>
              </div>
              <div style={styles.cartItems}>
                {cart.items.map((item) => (
                  <div key={item.id} style={styles.cartItem}>
                    <span style={{ color: '#8a7560' }}>{item.product_name}</span>
                    <span style={{ color: '#5a4a38' }}>×{item.quantity}</span>
                    <span style={{ color: '#c8871e' }}>${item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { padding: '2rem', maxWidth: 1100, margin: '0 auto', background: '#0c0a07', minHeight: '100vh' },
  heading: { color: '#f0e8d8', marginBottom: '1rem', fontStyle: 'italic' },
  flash: { background: 'rgba(200,135,30,0.1)', color: '#c8871e', padding: '0.6rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.9rem', border: '1px solid rgba(200,135,30,0.2)' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' },
  tab: {
    padding: '0.55rem 1.2rem', borderRadius: 8, border: 'none',
    background: '#161108', color: '#5a4a38', cursor: 'pointer', fontSize: '0.9rem', border: '1px solid #2a2016',
  },
  activeTab: { background: '#c8871e', color: '#0c0a07', fontWeight: 700, border: '1px solid #c8871e' },
  addBtn: {
    padding: '0.6rem 1.2rem', background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
  },
  reverbBtn: {
    padding: '0.6rem 1.2rem', background: '#221a12', color: '#c8871e',
    border: '1px solid #3a2a14', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
  },
  table: { width: '100%', borderCollapse: 'collapse', background: '#161108', borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2016' },
  thead: { background: '#1e1810' },
  th: { padding: '0.75rem 1rem', color: '#8a7560', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600 },
  tr: { borderBottom: '1px solid #2a2016' },
  td: { padding: '0.75rem 1rem', color: '#c8b89a', fontSize: '0.9rem' },
  editBtnSm: {
    padding: '0.3rem 0.7rem', background: '#1e3a5f', color: '#93c5fd',
    border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', marginRight: 6,
  },
  delBtnSm: {
    padding: '0.3rem 0.7rem', background: '#3b0d0d', color: '#fca5a5',
    border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem',
  },
  roleSelect: {
    background: '#1e1810', color: '#c8b89a', border: '1px solid #2a2016',
    borderRadius: 6, padding: '0.3rem 0.5rem', cursor: 'pointer',
  },
  modal: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
  },
  modalBox: {
    background: '#161108', borderRadius: 12, padding: '2rem',
    width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
    border: '1px solid #2a2016',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  label: { color: '#8a7560', fontSize: '0.82rem', display: 'block', marginBottom: 3 },
  input: {
    width: '100%', padding: '0.6rem 0.9rem', borderRadius: 6, border: '1px solid #2a2016',
    background: '#0c0a07', color: '#f0e8d8', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  },
  modalBtns: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  saveBtn: {
    flex: 1, padding: '0.7rem', background: '#c8871e', color: '#0c0a07',
    border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700,
  },
  cancelBtn: {
    flex: 1, padding: '0.7rem', background: '#1e1810', color: '#8a7560',
    border: '1px solid #2a2016', borderRadius: 8, cursor: 'pointer',
  },
  cartCard: { background: '#161108', borderRadius: 10, overflow: 'hidden', border: '1px solid #2a2016' },
  cartHeader: {
    display: 'flex', gap: '1.5rem', alignItems: 'center',
    padding: '0.9rem 1.2rem', background: '#1e1810', borderBottom: '1px solid #2a2016',
  },
  cartItems: { padding: '0.75rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  cartItem: { display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' },
}
