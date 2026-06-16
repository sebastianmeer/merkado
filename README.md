<div align="center">

# 🏪 Local Marketplace

**A production-grade community marketplace API and web client for local trading.**

Buy, sell, and browse items in your neighborhood — built with enterprise-level security, a modern React frontend, and a battle-tested Express + MongoDB backend.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)

</div>

---

## Highlights

### 🔒 Security-First Architecture

This project implements a **multi-layered security strategy** that goes well beyond the basics:

| Layer | Implementation | What It Protects Against |
|-------|---------------|--------------------------|
| **Rate Limiting** | `express-rate-limit` — 100 requests per IP per hour on all `/api` routes | Brute-force attacks, DDoS, credential stuffing |
| **HTTP Security Headers** | `helmet` with custom CSP directives (script-src, style-src, font-src, connect-src) | XSS, clickjacking, MIME-type sniffing, code injection |
| **NoSQL Injection Prevention** | `express-mongo-sanitize` — strips `$` and `.` operators from user input | MongoDB operator injection (`$gt`, `$ne`, `$regex`) |
| **Cross-Site Scripting (XSS)** | `xss-clean` — sanitizes request body, query strings, and URL params | Stored and reflected XSS attacks |
| **HTTP Parameter Pollution** | `hpp` with field-level whitelist (`price`, `category`, `seller`, etc.) | Duplicate query parameter attacks |
| **Request Body Size Limit** | `express.json({ limit: '10kb' })` | Payload-based denial of service |
| **Password Validation** | Server-side middleware enforces minimum 8 characters before reaching the model | Weak credential submissions |

### 🔑 Complete Authentication System

A full JWT-based authentication flow with production-ready security measures:

- **JWT Token Issuance** — signed tokens with configurable expiration (`JWT_EXPIRES_IN`)
- **HTTP-Only Cookies** — tokens stored in `httpOnly`, `sameSite: 'lax'` cookies; `secure` flag auto-enabled in production
- **Bearer Token Support** — dual-mode auth via `Authorization: Bearer <token>` header or cookie
- **Token Sanitization** — smart token cleaning that strips stray quotes, duplicate `Bearer` prefixes, and catches common Postman misconfiguration
- **Password Hashing** — bcrypt with 12 salt rounds
- **Password Reset Flow** — crypto-generated reset tokens, SHA-256 hashed and stored with 10-minute expiry, delivered via email (Nodemailer + SMTP)
- **Password Change Detection** — `changedPasswordAfter()` method invalidates tokens issued before a password change
- **Soft Delete** — account deletion deactivates rather than destroys (`active: false`), preserving data integrity
- **Response Sanitization** — password fields stripped from all user responses

### 🛡️ Role-Based Access Control (RBAC)

```
Public          →  signup, login, forgot password, reset password
Authenticated  →  browse products, view profile, update profile, change password
Admin Only     →  create, update, and delete products
```

The `restrictTo('admin')` middleware enforces role boundaries at the route level — admin-only operations (product CRUD) are completely unreachable by regular users.

### 📦 Advanced Query Engine

The `APIFeatures` utility class provides a chainable, MongoDB-powered query pipeline:

| Feature | Usage | Example |
|---------|-------|---------|
| **Filtering** | MongoDB operators via query string | `?price[gte]=100&category=Electronics` |
| **Sorting** | Multi-field, direction-aware | `?sort=price,-postedDate` |
| **Field Selection** | Projection control | `?fields=name,price,seller` |
| **Pagination** | Page + limit based | `?page=2&limit=10` |
| **Aliased Routes** | Preset query shortcuts | `/top-3-cheapest` → sorted by price, limited to 3 |

### 📊 Aggregation Pipeline

The `/product-category` endpoint runs a **MongoDB aggregation pipeline** that computes real-time analytics per category:

- Product count per category
- Average, minimum, and maximum prices
- Full product list per group
- Sorted by average price ascending

### 🧠 Smart Data Modeling

**Product Model:**
- Auto-generated slugs via `slugify` on save, update, and bulk insert
- Virtual `daysPosted` field computed from `postedDate`
- Compound indexes on `price` + `name` for query performance
- Custom discount validator that cross-references the parent price (works on both document save and query update)
- Premium product filtering via pre-find and pre-aggregate hooks — hidden from all public queries

**User Model:**
- Email validation via `validator.isEmail`
- Automatic password hashing on save (bcrypt, 12 rounds)
- `passwordConfirm` field cleared after hashing — never persisted
- Inactive user filtering via pre-find hook
- Cryptographic password reset token generation with SHA-256 hashing

### 🌐 Full-Stack Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Client (Vite + React)               │
│  React 19 · React Router 7 · TypeScript · Vanilla CSS    │
│  Sidebar navigation · Skeleton UI · Responsive layout    │
├──────────────────────────────────────────────────────────┤
│                      Express 5 API                       │
│  Versioned routes (/api + /api/v1)                       │
│  Helmet CSP · Rate Limiter · Mongo Sanitize · XSS Clean  │
│  HPP · Cookie Parser · Morgan (dev)                      │
├──────────────────────────────────────────────────────────┤
│                      MongoDB (Mongoose 9)                │
│  Cached connection · IPv4 forced · Configurable timeout  │
│  Aggregation pipelines · Compound indexes · Virtuals     │
├──────────────────────────────────────────────────────────┤
│                      Infrastructure                      │
│  Render deployment (render.yaml)                         │
│  Graceful shutdown (uncaughtException, unhandledRejection)│
│  Environment-aware error responses (dev vs prod)         │
└──────────────────────────────────────────────────────────┘
```

### 🚨 Centralized Error Handling

A global error handler that differentiates between development and production environments:

- **Development** — full error object, message, and stack trace returned
- **Production** — operational errors return clean user-facing messages; programming errors return a generic `500`
- **Specialized Handlers** — `CastError` (invalid MongoDB IDs), duplicate key violations (`11000`), Mongoose validation errors, JWT verification failures, and expired tokens are each caught and transformed into descriptive `AppError` instances
- **Async Error Wrapper** — `catchAsync` utility eliminates try-catch boilerplate across all controllers

### 🏗️ Production Deployment Ready

- **Render.yaml** — one-click deployment blueprint with health checks and environment variable mapping
- **Static File Serving** — Express serves the built React client, with SPA fallback routing (`/(?!api).*/` → `index.html`)
- **Automatic Client Build** — `prestart` hook ensures the client is built before the server starts
- **Graceful Shutdown** — `uncaughtException` and `unhandledRejection` handlers prevent silent crashes
- **Connection Caching** — MongoDB connection is cached globally and reused, with automatic reconnection logic

### 🎨 Modern Frontend

- **React 19** with TypeScript and React Router 7
- **Vite 7** for instant HMR and optimized builds
- **Design System** — CSS custom properties for colors, spacing, typography, shadows, and radius
- **Inter + Nunito Sans** typography via Google Fonts
- **Responsive** — 4 breakpoints (480px, 720px, 1100px, 1440px)
- **Accessibility** — `focus-visible` states, `prefers-reduced-motion` support, `aria` labels, semantic HTML
- **Skeleton UI** — shimmer loading states ready for real data integration

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22+ |
| Language | TypeScript | 6.x |
| Server | Express | 5.x |
| Database | MongoDB + Mongoose | 9.x |
| Auth | JSON Web Tokens (jsonwebtoken) | 9.x |
| Hashing | bcryptjs | 3.x |
| Email | Nodemailer | 8.x |
| Frontend | React | 19.x |
| Bundler | Vite | 7.x |
| Routing | React Router | 7.x |
| Deployment | Render | — |

---

## Getting Started

### Prerequisites

- **Node.js** 22 or later
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **SMTP credentials** for password reset emails (e.g., [Mailtrap](https://mailtrap.io) for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/sebastianmeer/Marketplace.git
cd Marketplace

# Install server dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### Configuration

Copy the example environment file and fill in your values:

```bash
cp config.env.example config.env
```

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<username>:<PASSWORD>@cluster.mongodb.net/marketplace
DATABASE_PASSWORD=your_database_password
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```

### Seed Data

```bash
# Import sample products
npm run data:import

# Clear all product data
npm run data:delete
```

### Running

```bash
# Development — server with hot reload
npm run start:dev

# Development — client only (Vite HMR)
npm run client:dev

# Production
npm start
```

---

## API Reference

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/signup` | Public | Create a new account |
| `POST` | `/api/auth/login` | Public | Sign in and receive JWT |
| `GET` | `/api/auth/logout` | Public | Clear auth cookie |
| `POST` | `/api/auth/forgotPassword` | Public | Request password reset email |
| `PATCH` | `/api/auth/resetPassword/:token` | Public | Reset password with token |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `PATCH` | `/api/auth/updateMe` | Authenticated | Update name, email, or photo |
| `PATCH` | `/api/auth/updateMyPassword` | Authenticated | Change password |
| `DELETE` | `/api/auth/deleteMe` | Authenticated | Soft-delete account |

### Products

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/products` | Authenticated | List products (filterable, sortable, paginated) |
| `GET` | `/api/products/:id` | Authenticated | Get single product |
| `POST` | `/api/products` | Admin | Create a product |
| `PATCH` | `/api/products/:id` | Admin | Update a product |
| `DELETE` | `/api/products/:id` | Admin | Delete a product |
| `GET` | `/api/products/top-3-cheapest` | Authenticated | Aliased query — 3 cheapest products |
| `GET` | `/api/products/product-category` | Authenticated | Aggregation — stats per category |

> All product endpoints also available under `/api/v1/products` for API versioning.

---

## Project Structure

```
marketplace/
├── app.ts                  # Express app configuration (middleware, routes, security)
├── server.ts               # Server entry point (DB connection, graceful shutdown)
├── config.env.example      # Environment variable template
├── render.yaml             # Render deployment blueprint
├── import-dev-data.ts      # Database seeder (import/delete)
│
├── controllers/
│   ├── authController.ts   # Auth logic (signup, login, password reset, profile)
│   ├── productController.ts # Product CRUD + aggregation pipeline
│   └── errorController.ts  # Global error handler (dev/prod split)
│
├── middleware/
│   └── authMiddleware.ts   # JWT verification (protect) + RBAC (restrictTo)
│
├── models/
│   ├── productModel.ts     # Product schema (slugs, virtuals, validators, hooks)
│   └── userModel.ts        # User schema (bcrypt, reset tokens, soft delete)
│
├── routes/
│   ├── authRoutes.ts       # Auth route definitions
│   └── productRoutes.ts    # Product route definitions
│
├── utils/
│   ├── apiFeatures.ts      # Query builder (filter, sort, fields, paginate)
│   ├── appError.ts         # Custom operational error class
│   ├── catchAsync.ts       # Async error wrapper
│   └── email.ts            # Nodemailer SMTP transport
│
├── db/
│   └── connect.ts          # Cached MongoDB connection
│
├── data/
│   └── products.json       # Seed data (15 products across 7 categories)
│
└── client/                 # React + Vite frontend
    ├── src/
    │   ├── components/     # AppShell, AuthShell, Skeleton
    │   ├── pages/          # Products, Admin, Profile, Login, Signup, Reset
    │   ├── lib/            # Utilities
    │   ├── styles.css      # Design system + component styles
    │   └── App.tsx         # Route definitions
    └── index.html          # Entry point with Google Fonts
```

---

## Categories

The marketplace supports **8 product categories**, enforced at the schema level:

`Electronics` · `Clothes` · `Books` · `Food` · `Home` · `Services` · `Sports` · `Others`

---

## Authors

**GT1C-MEER**

---

## License

ISC
