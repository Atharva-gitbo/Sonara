# ShopCart — E-commerce SPA

A full-stack single-page e-commerce application built with the **FARM stack** (FastAPI, React, MongoDB).

## Problem Statement

ShopCart allows users to browse products, manage a personal shopping cart, and update their profile — while giving admins full control over inventory and user management.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 (Vite), React Router v6    |
| Backend   | FastAPI (Python 3.11+)              |
| Database  | MongoDB (Motor async driver)        |
| Auth      | JWT (`python-jose`) + bcrypt (`passlib`) |
| HTTP      | Axios (with interceptors)           |

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
python seed.py                  # seeds sample products + admin account
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

**Default admin credentials:** `admin@shop.com` / `admin123`

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
│   ├── .env               # Environment variables (Mongo URL, JWT secret)
│   ├── models/
│   │   ├── user.py        # Pydantic schemas for user CRUD
│   │   ├── product.py     # Pydantic schemas for product CRUD
│   │   └── cart.py        # Pydantic schemas for cart operations
│   └── routers/
│       ├── users.py       # /api/users — register, login, profile, admin user mgmt
│       ├── products.py    # /api/products — CRUD, search, categories
│       └── cart.py        # /api/cart — user cart + admin view of all carts
│
└── frontend/
    ├── index.html         # Single HTML entry point (SPA)
    ├── vite.config.js     # Vite config with /api proxy
    ├── package.json
    └── src/
        ├── main.jsx       # React DOM root
        ├── App.jsx        # Router + route definitions
        ├── index.css      # Global styles
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
- **Live search** — 300ms debounced search on the home page filters products in real-time
- **CRUD** — full create/read/update/delete on all three entities (users, products, cart items)
- **Role-based access** — `user` vs `admin` roles; admin routes protected both in API and UI
- **Admin dashboard** — manage products, promote/delete users, view all users' carts

---

## Database Export

Run the following to export the database:

```bash
mongoexport --db shopdb --collection products --out products.json
mongoexport --db shopdb --collection users --out users.json
```

---

## Workload Allocation

*(Update this section with your group members)*

| Member | Files |
|--------|-------|
| Kunj Vania | All files (individual submission) |
