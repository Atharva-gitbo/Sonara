# Sonara — Guitar & Gear Store

A full-stack single-page e-commerce application built with the **FARM stack** (FastAPI, React, MongoDB).

## Problem Statement

Sonara solves the problem of discovering and purchasing guitars and music gear online. Users can browse a curated catalogue, manage a personal shopping cart, and update their profile. Admins have full control over inventory, user accounts, and can view all active shopping carts.

---

## Tech Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Frontend  | React 18 (Vite), React Router v6         |
| Backend   | FastAPI (Python 3.11+)                   |
| Database  | MongoDB (Motor async driver)             |
| Auth      | JWT (`python-jose`) + bcrypt (`passlib`) |
| HTTP      | Axios (with interceptors)                |

---

## How to Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit .env with your values
python seed.py                  # seeds sample products + admin account
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

> Admin credentials are set via `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Folder Structure

```
/
├── backend/
│   ├── main.py            # FastAPI app entry point, CORS, lifespan
│   ├── database.py        # MongoDB connection + index setup
│   ├── auth.py            # JWT creation/verification, password hashing, route guards
│   ├── seed.py            # One-time DB seeder (products + admin user)
│   ├── requirements.txt
│   ├── .env.example       # Template for required environment variables
│   ├── models/
│   │   ├── user.py        # Pydantic schemas for user CRUD
│   │   ├── product.py     # Pydantic schemas for product CRUD
│   │   └── cart.py        # Pydantic schemas for cart operations
│   └── routers/
│       ├── users.py       # /api/users — register, login, profile, admin user mgmt
│       ├── products.py    # /api/products — CRUD, search, categories
│       ├── cart.py        # /api/cart — user cart + admin view of all carts
│       └── reverb.py      # /api/reverb — import products from Reverb marketplace
│
└── frontend/
    ├── index.html         # Single HTML entry point (SPA)
    ├── vite.config.js     # Vite config with /api proxy
    ├── package.json
    └── src/
        ├── main.jsx       # React DOM root
        ├── App.jsx        # Router + route definitions
        ├── index.css      # Global styles and CSS variables
        ├── api/
        │   └── api.js     # Axios instance with JWT interceptor + 401 redirect
        ├── context/
        │   └── AuthContext.jsx  # Auth state, login/register/logout, token storage
        ├── components/
        │   ├── Navbar.jsx       # Sticky nav with cart badge + role-based links
        │   ├── ProductCard.jsx  # Product tile with add-to-cart / admin edit+delete
        │   └── ProtectedRoute.jsx # Route guard (auth + admin-only)
        └── pages/
            ├── Home.jsx    # Product listing with live search + category filter
            ├── Login.jsx   # Login form
            ├── Register.jsx # Registration form
            ├── Cart.jsx    # User's cart with qty controls + order summary
            ├── Profile.jsx # Edit profile + change password
            └── Admin.jsx   # Admin dashboard: products CRUD, user mgmt, all carts
```

---

## Key Features

- **Single-page app** — only one `index.html`; all navigation is client-side via React Router
- **JWT auth** — tokens stored in `localStorage`, sent via `Authorization: Bearer` header
- **Password hashing** — bcrypt via `passlib`; plain-text passwords never stored
- **Live search** — debounced search on the home page filters products in real-time
- **Full CRUD** — create, read, update, delete on all three entities (users, products, cart items)
- **Role-based access** — `user` vs `admin` roles; admin routes protected in both API and UI
- **Admin dashboard** — manage products, promote/delete users, view all users' carts
- **Reverb integration** — admins can import live guitar listings from the Reverb marketplace API

---

## Database Export

Run the following to export the database:

```bash
mongoexport --db shopdb --collection products --out products.json
mongoexport --db shopdb --collection users --out users.json
mongoexport --db shopdb --collection cart --out cart.json
```

---

## Workload Allocation

| Member | Files |
|--------|-------|
| Kunj Vania | `backend/main.py`, `backend/database.py`, `backend/auth.py`, `backend/seed.py`, `backend/models/user.py`, `backend/models/product.py`, `backend/models/cart.py`, `backend/routers/users.py`, `backend/routers/products.py`, `backend/routers/cart.py`, `frontend/src/main.jsx`, `frontend/src/App.jsx`, `frontend/src/api/api.js`, `frontend/src/context/AuthContext.jsx`, `frontend/src/components/Navbar.jsx`, `frontend/src/components/ProtectedRoute.jsx`, `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`, `frontend/src/pages/Cart.jsx`, `frontend/src/pages/Profile.jsx` |
| Atharva | `backend/routers/reverb.py`, `frontend/src/index.css`, `frontend/src/components/ProductCard.jsx` |
| Kunj Vania & Atharva | `frontend/src/pages/Home.jsx` (Kunj: initial layout and search logic; Atharva: hero visuals and store styling), `frontend/src/pages/Admin.jsx` (Kunj: CRUD tables and user management; Atharva: Reverb import feature) |
