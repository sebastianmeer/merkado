<div align="center">

# Merkado

**A full-stack ecommerce platform built with Express 5, Mongoose 9, and React 19.**

Full-stack TypeScript · Production-grade security · JWT authentication · Role-based access control · Advanced query engine · Render-ready deployment

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node_22+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=flat-square)](https://opensource.org/licenses/ISC)

</div>

---

## Overview

Merkado is a full-stack ecommerce platform featuring a security-hardened RESTful API and a modern React storefront — built entirely in TypeScript with pure ESM and top-level `await`. It implements real-world patterns like multi-layered middleware security, cryptographic auth flows, advanced MongoDB aggregation, and role-based access control.

> ** Actively developed** — This started as a school project and has since grown into an ongoing personal project where I apply and solidify concepts in full-stack development, API design, and application security.

---

## Features

###  Authentication & Authorization
- JWT-based auth with dual-mode token delivery (Authorization header + httpOnly cookies)
- Multi-stage token validation pipeline that catches malformed tokens, expired sessions, and post-password-change invalidation
- Cryptographic password reset flow using SHA-256 hashed tokens with time-boxed expiry
- Role-based access control via a higher-order middleware factory (`admin`, `user`)

###  Security
Every request passes through a layered middleware pipeline:
- **Helmet** with custom Content Security Policy directives
- **Rate limiting** (IETF draft-8 standard headers, scoped to `/api`)
- **NoSQL injection prevention** — `$` and `.` operator stripping on all inputs
- **XSS sanitization** on body, query, and params
- **HTTP Parameter Pollution** protection with field-level whitelisting
- **Request body size limits** (10 KB hard cap)
- **Express 5 compatibility layer** — custom middleware to handle frozen `req.query`/`req.params` for sanitization

###  Product Management
- Full CRUD with admin-only write access
- Auto-generated slugs via lifecycle hooks across `save`, `findOneAndUpdate`, and `insertMany`
- Premium product filtering — hidden from all read paths (queries and aggregations) via pre-hooks
- Cross-context discount validation that works in both document and query contexts
- Computed virtual fields (e.g., `daysPosted`) with no database overhead
- Compound indexing for optimized sort + filter queries

### 🔍 Advanced Query Engine
Chainable builder pattern supporting:
- **Filtering** — `?price[gte]=100&price[lte]=500` → MongoDB `$gte`/`$lte`
- **Multi-field sorting** — `?sort=price,-postedDate`
- **Field projection** — `?fields=name,price,seller`
- **Pagination** — `?page=2&limit=10`
- **Aliased routes** — `/top-3-cheapest` with pre-injected query defaults

###  Aggregation
Per-category product statistics computed in a single database round-trip — product count, average/min/max price, and full product lists per category.

###  User Management
- Profile self-service (update name, email, photo)
- Soft-delete pattern — deactivated accounts are filtered from all queries, preserving referential integrity
- Password hashing with bcrypt (cost factor 12)

###  Architecture
- **Pure ESM** with top-level `await` — database connects before the server binds
- **`globalThis` connection caching** — serverless-safe, survives hot reloads and test suites
- **Lazy reconnection** — dropped connections auto-recover on the next request
- **Centralized error handling** — dev/prod response splitting with 5 specialized error transformers (CastError, duplicate key, validation, JWT invalid, JWT expired)
- **Graceful shutdown** — handles both `uncaughtException` and `unhandledRejection`
- **Automated client build gate** — `prestart` hook ensures the React build exists before the server starts
- **SPA routing** — regex-based catch-all with negative lookahead to avoid intercepting API routes
- **API versioning** — all routes mounted at both `/api` and `/api/v1`

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 22+ |
| Language | TypeScript (full-stack) |
| Server | Express 5 |
| Database | MongoDB via Mongoose 9 |
| Auth | JWT + bcrypt |
| Email | Nodemailer (SMTP) |
| Frontend | React 19 + React Router 7 |
| Bundler | Vite 7 |
| Executor | tsx (no compilation step) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **SMTP** credentials — [Mailtrap](https://mailtrap.io) recommended for development

### Installation

```bash
git clone https://github.com/your-username/merkado.git
cd merkado

npm install                    # server dependencies
npm --prefix client install    # client dependencies
```

### Configuration

Copy the example environment file, then fill in your credentials:

```bash
cp config.env.example config.env
```

See `config.env.example` for the full list of required variables.

### Seed Data

```bash
npm run data:import    # load sample products
npm run data:delete    # clear all products
```

### Run

```bash
npm run start:dev      # server with file watching
npm run client:dev     # client with Vite HMR
npm start              # production (auto-builds client if needed)
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | — | Create account, returns JWT |
| `POST` | `/api/auth/login` | — | Authenticate, returns JWT |
| `GET` | `/api/auth/logout` | — | Clear JWT cookie |
| `POST` | `/api/auth/forgotPassword` | — | Send reset token via email |
| `PATCH` | `/api/auth/resetPassword/:token` | — | Reset password with token |
| `GET` | `/api/auth/me` | JWT | Current user profile |
| `PATCH` | `/api/auth/updateMe` | JWT | Update name/email/photo |
| `PATCH` | `/api/auth/updateMyPassword` | JWT | Change password |
| `DELETE` | `/api/auth/deleteMe` | JWT | Deactivate account |

### Product Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | JWT | List products (filter, sort, paginate) |
| `GET` | `/api/products/:id` | JWT | Get single product |
| `POST` | `/api/products` | Admin | Create product |
| `PATCH` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/products/top-3-cheapest` | JWT | Top 3 cheapest (aliased query) |
| `GET` | `/api/products/product-category` | JWT | Aggregated stats per category |

> All endpoints are also available under `/api/v1/` for versioned access.