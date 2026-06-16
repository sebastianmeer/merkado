<div align="center">

# 🏪 Local Marketplace

**A production-grade community marketplace built on Express 5, Mongoose 9, and React 19.**

Full-stack TypeScript · Multi-layered security hardening · JWT auth with cryptographic password reset · Advanced MongoDB query pipeline · Role-based access control · Render-ready deployment

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/Mongoose_9-47A248?style=flat-square&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=flat-square&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node_22+-339933?style=flat-square&logo=node.js&logoColor=white)
![ESM](https://img.shields.io/badge/Pure_ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

---

## Technical Highlights

### Pure ESM Architecture with Top-Level `await`

The entire codebase runs as native ES Modules (`"type": "module"` in both server and client). The server entry point uses **top-level `await`** — the database connection is established before the HTTP server binds, not inside a callback:

```ts
// server.ts — top-level await, no async IIFE wrapper
await connectDB();
const port = process.env.PORT || 3000;
server = app.listen(port, () => { ... });
```

Morgan is conditionally loaded via **dynamic `import()`** — it never touches the production bundle:

```ts
if (process.env.NODE_ENV === 'development') {
  const { default: morgan } = await import('morgan');
  app.use(morgan('dev'));
}
```

Both packages use `tsx` as their runtime, giving full TypeScript execution without a compilation step. The client uses Vite's `moduleResolution: "Bundler"` with React's automatic JSX transform (`"jsx": "react-jsx"`). The server targets `ES2022` with `"module": "ESNext"` — no CommonJS shims anywhere.

---

### 7-Layer Security Middleware Pipeline

Every API request passes through a strict, ordered middleware chain. The order is deliberate — each layer builds on the previous:

```
Request
  │
  ├─ 1. Helmet (HTTP headers + Content Security Policy)
  ├─ 2. Rate Limiter (100 req/IP/hour, draft-8 headers)
  ├─ 3. Body Parser (10 KB hard limit)
  ├─ 4. Cookie Parser
  ├─ 5. Property Descriptor Rewrite (Express 5 compat)
  ├─ 6. MongoDB Sanitization ($, . operator stripping)
  ├─ 7. Password Length Gate (8-char minimum at middleware level)
  ├─ 8. XSS Sanitization (body, query, params)
  ├─ 9. HPP (whitelist: price, priceDiscount, category, seller, name, postedDate)
  │
  └─ Route Handler
```

#### Helmet CSP — Directive-Level Control

Not just `helmet()` with defaults. The Content Security Policy is manually configured with five distinct directives:

```ts
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
  },
}
```

This locks down `connect-src` to same-origin only (no external API calls from the browser), allows Google Fonts in `style-src`/`font-src`, and permits data URIs for images.

#### Rate Limiter — IETF Draft-8 Standard Headers

The rate limiter uses `standardHeaders: 'draft-8'` — this means responses include the modern `RateLimit` header (single combined header) instead of the older `X-RateLimit-*` triple. Legacy headers are explicitly disabled. The limiter is scoped to `/api` only (static assets are not rate-limited) and is disabled entirely in test environments:

```ts
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,     // 1-hour sliding window
  limit: 100,                    // per IP
  standardHeaders: 'draft-8',   // RateLimit header (IETF)
  legacyHeaders: false,          // no X-RateLimit-*
  message: { status: 'fail', message: 'Too many requests...' },
});

if (process.env.NODE_ENV !== 'test') {
  app.use('/api', limiter);
}
```

#### Express 5 Property Descriptor Compatibility Layer

Express 5 freezes `req.query` and `req.params` as non-writable properties. The `express-mongo-sanitize` library needs to mutate these objects to strip injection operators. This project solves it with a **custom middleware** that uses `Object.defineProperty` to re-declare both properties as writable *before* the sanitizer runs:

```ts
const makeSanitizedFieldsWritable = (req: Request, res: Response, next: NextFunction) => {
  ['query', 'params'].forEach((field) => {
    if (req[field as keyof Request] !== undefined) {
      Object.defineProperty(req, field, {
        value: req[field as keyof Request],
        writable: true,        // ← unlocks for mongo-sanitize
        enumerable: true,
        configurable: true,
      });
    }
  });
  next();
};
```

This is a non-obvious Express 5 migration detail that most projects miss entirely — breaking `mongoSanitize()` silently.

#### HPP Whitelist — Field-Level Allowed Duplicates

HTTP Parameter Pollution protection is not just enabled — it's configured with a field-level whitelist. Only these 6 fields are allowed to appear as duplicated query parameters (needed for multi-value filtering):

```
price · priceDiscount · category · seller · name · postedDate
```

All other duplicated parameters are collapsed to the last value, preventing array injection into unexpected query fields.

---

### JWT Authentication — Multi-Stage Token Validation Pipeline

The `protect` middleware doesn't just verify a JWT. It runs a **5-stage validation pipeline** that catches real-world edge cases:

```
Token Extraction (Header or Cookie)
  │
  ├─ Stage 1: Null check → 401 "not logged in"
  ├─ Stage 2: Postman variable detection ({{ }}) → 401 with specific guidance
  ├─ Stage 3: Structural validation (3-part dot format) → 401 with fix instructions
  ├─ Stage 4: Cryptographic verification (jwt.verify) → 401 on invalid/expired
  ├─ Stage 5: User existence check → 401 if user deleted after token issued
  └─ Stage 6: Password change check → 401 if password changed after token issued
```

**Stage 2** detects unresolved Postman environment variables (`{{token}}`) and returns a *specific error message* telling the user what went wrong. **Stage 3** catches literal `"undefined"`, `"null"` strings, and malformed tokens before they hit the crypto layer.

The token extraction itself is hardened with a `cleanToken()` helper:

```ts
const cleanToken = (rawToken: string) =>
  rawToken
    .trim()
    .replace(/^Bearer\s+/i, '')   // strip duplicate Bearer prefix (case-insensitive)
    .replace(/^["']|["']$/g, '')  // strip wrapping quotes
    .trim();
```

This handles common API client mistakes: double `Bearer Bearer`, quoted tokens, whitespace-padded tokens.

#### Dual-Mode Token Delivery

Tokens are accepted from two sources with explicit priority:
1. `Authorization: Bearer <token>` header (API clients, Postman)
2. `jwt` cookie (browser sessions)

Cookies are set as `httpOnly` (no JavaScript access), `sameSite: 'lax'` (CSRF protection), with `secure: true` auto-enabled in production (HTTPS-only transmission).

---

### Password Security — Cryptographic Reset Flow

The password reset flow uses Node's `crypto` module with a **split-token pattern**:

1. **Token Generation** — `crypto.randomBytes(32)` produces 256 bits of entropy
2. **Hash-Before-Store** — the token is SHA-256 hashed before saving to the database. The raw token is sent via email; only the hash is persisted. Even a database breach doesn't expose usable tokens
3. **Time-Boxed Expiry** — tokens expire after 10 minutes (`Date.now() + 10 * 60 * 1000`)
4. **Single-Use** — on successful reset, both `passwordResetToken` and `passwordResetExpires` are set to `undefined`
5. **Timestamp Backdating** — when a password changes, `passwordChangedAt` is set to `Date.now() - 1000` (1 second in the past). This ensures any JWT issued *during* the save operation (before the timestamp is written) is still invalidated

The `changedPasswordAfter()` instance method compares the JWT's `iat` (issued-at) claim against the password change timestamp, converting the `Date` to a Unix epoch for direct comparison.

---

### Role-Based Access Control (RBAC)

Authorization is enforced at the **route level** via a higher-order middleware factory:

```ts
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes((req.user as any).role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
```

The `protect` middleware (JWT verification) runs first and attaches `req.user`. Then `restrictTo('admin')` checks the role. This is applied at the router level using Express middleware chaining:

```
Public          →  signup, login, forgotPassword, resetPassword
Authenticated  →  all product reads, getMe, updateMe, updateMyPassword, deleteMe
Admin Only     →  POST/PATCH/DELETE on /products
```

Product routes use `router.use(protect)` at the top — every product endpoint requires authentication before the route handler even runs.

---

### Mongoose Data Modeling — Beyond Basic CRUD

#### Product Model — 5 Lifecycle Hooks + Cross-Context Validator

The product schema uses **3 distinct pre-save/update hooks** for auto-slug generation:

| Hook | Trigger | What It Does |
|------|---------|--------------|
| `pre('save')` | `Product.create()`, `doc.save()` | Sets `productSlug` from `name` |
| `pre('findOneAndUpdate')` | `Product.findByIdAndUpdate()` | Reads `name` from update payload (`$set` or top-level), sets slug on the update object |
| `pre('insertMany')` | Bulk seed import | Iterates the docs array and sets slug on each |

The slug format is `UPPERCASE-KEBAB` — `slugify(name, { lower: false }).toUpperCase()`.

**Premium Product Filtering** is implemented via **two query-level hooks** that inject a `$match` / `find` clause *before* the user's query runs:

```ts
productSchema.pre(/^find/, function () {
  this.find({ premiumProducts: { $ne: true } });
});

productSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});
```

The `/^find/` regex catches `find`, `findOne`, `findById`, `findOneAndUpdate`, and `findOneAndDelete` — premium products are invisible across all read paths, including aggregations. The `premiumProducts` field itself has `select: false`, so it's also excluded from response payloads.

**Cross-Context Discount Validator** — the `priceDiscount` validator works in both document context (`this` is the document) and query context (`this` is the Query object):

```ts
validate: {
  validator: function (this: any, val: number) {
    // Document context: this.price exists directly
    // Query context: need this.getUpdate() to find the price
    const update = this instanceof mongoose.Query ? this.getUpdate() : null;
    const price = update ? update.price || (update.$set && update.$set.price) : this.price;
    return val < price;
  },
}
```

This is a non-trivial Mongoose pattern — most validators break silently on `findOneAndUpdate` because `this` isn't a document. This implementation handles both `$set`-wrapped and top-level update payloads.

**Computed Virtual** — `daysPosted` is a runtime-computed virtual field (no database storage):

```ts
productSchema.virtual('daysPosted').get(function () {
  if (!this.postedDate) return null;
  const diffMs = Date.now() - this.postedDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});
```

Enabled via `{ toJSON: { virtuals: true }, toObject: { virtuals: true } }` in schema options.

**Compound Index** — `{ price: 1, name: 1 }` covers the most common sort + filter queries.

#### User Model — Pre-Query Soft Delete Filtering

The User model uses a **pre-find hook** that injects `{ active: { $ne: false } }` into every query:

```ts
userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});
```

This means `User.find()`, `User.findById()`, `User.findOne()` — all silently exclude deactivated accounts. The `active` field has `select: false`, so it's never exposed in API responses. The `deleteMe` controller sets `active: false` instead of destroying the document — a **soft delete** pattern that preserves referential integrity.

Password hashing uses **bcrypt with a cost factor of 12** (4,096 iterations). The `passwordConfirm` field is set to `undefined` after hashing — it's validated against `password` during document save, then discarded. It's never persisted to the database.

---

### Chainable Query Engine — `APIFeatures`

The `APIFeatures` utility implements a **builder pattern** for MongoDB queries. Each method returns `this` for chaining:

```ts
const features = new APIFeatures(Product.find(), req.query)
  .filter()       // Strip control params, convert gte/gt/lte/lt → $gte/$gt/$lte/$lt
  .sort()         // Multi-field: ?sort=price,-postedDate → .sort('price -postedDate')
  .limitFields()  // Projection: ?fields=name,price → .select('name price')
  .paginate();    // ?page=2&limit=10 → .skip(10).limit(10)
```

**Duplicate parameter normalization** — the `normalizeQueryValue()` helper extracts the last value from any array (preventing HPP bypass at the query level):

```ts
const normalizeQueryValue = (value: unknown) =>
  Array.isArray(value) ? value[value.length - 1] : value;
```

**Operator translation** — the filter method converts human-readable operators to MongoDB syntax using regex replacement:

```
?price[gte]=100&price[lte]=500
  → { price: { $gte: 100, $lte: 500 } }
```

**Aliased routes** — the `/top-3-cheapest` endpoint uses a pre-handler that injects default query parameters into `req._queryDefaults`:

```ts
export const aliasTopCheapProducts = (req, res, next) => {
  req._queryDefaults = {
    limit: '3',
    sort: 'price',
    fields: 'name,price,category,seller,postedDate,priceDiscount,productSlug',
  };
  next();
};
```

These defaults are merged with any user-supplied params, so the alias is still filterable.

---

### MongoDB Aggregation Pipeline

The `/product-category` endpoint runs a 5-stage aggregation:

```
$match → $group → $addFields → $project → $sort
```

It computes per-category statistics in a single database round-trip:
- Product count, average price (rounded to 2 decimals), min/max price
- Full product list per category (embedded array via `$push`)
- Sorted by average price ascending
- Filtered to products under 1000 (pre-match)

---

### `globalThis` Connection Caching

The database connection module uses a **`globalThis` singleton pattern** — the same pattern used by Next.js and Vercel for serverless-safe Mongoose connections:

```ts
const globalForMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached =
  globalForMongoose.mongoose ||
  (globalForMongoose.mongoose = { conn: null, promise: null });
```

This prevents connection leaks across hot reloads (`tsx watch`), serverless cold starts, and test suite runs. The connection check has **three levels**:

1. Return cached `conn` if it exists
2. Check `mongoose.connection.readyState === 1` (catches external connections)
3. Create new connection only if no cached promise exists

Failed connections **clear the cached promise** (`cached.promise = null`), allowing reconnection on the next request. The connection forces **IPv4** (`family: 4`) and has a **configurable server selection timeout** (`DB_SERVER_SELECTION_TIMEOUT_MS`, default 10s).

---

### Centralized Error Handling — Dev/Prod Split

The global error handler differentiates between environments:

- **Development** — returns full error object, message, and stack trace
- **Production** — operational errors (thrown via `AppError`) return clean messages; programming errors return generic `500 Something went very wrong!`

Five specialized error transformers catch MongoDB and JWT errors before they reach the response:

| Error Type | Source | Status | Transformation |
|-----------|--------|--------|---------------|
| `CastError` | Invalid ObjectId in URL params | 400 | `"Invalid _id: abc123."` |
| `11000` (duplicate key) | Unique constraint violation | 409 | `"Duplicate field value: email@test.com."` |
| `ValidationError` | Schema validation failure | 400 | Joins all error messages with `. ` |
| `JsonWebTokenError` | Invalid/malformed token | 401 | `"Invalid token. Please log in again."` |
| `TokenExpiredError` | JWT past expiration | 401 | `"Your token has expired. Please log in again."` |

The `AppError` class extends `Error` with `statusCode`, `status` (`'fail'` for 4xx, `'error'` for 5xx), and `isOperational: true`. The `catchAsync` wrapper eliminates try-catch in every controller — unhandled promise rejections are forwarded to `next()`.

The error handler preserves the **prototype chain** via `Object.create(Object.getPrototypeOf(err))` — ensuring `instanceof` checks work correctly on the transformed error.

---

### Graceful Shutdown Handlers

The server registers **both** Node.js crash handlers:

- `uncaughtException` — synchronous throws outside try-catch. Logs and exits immediately (process is in an undefined state).
- `unhandledRejection` — unhandled promise rejections. Calls `server.close()` first (drains in-flight requests), *then* exits. Falls back to immediate exit if the server hasn't started yet.

---

### Automated Client Build Gate

The `prestart` npm hook runs `scripts/ensure-client-build.ts` before every `npm start`. This script:

1. Checks if `client/dist/index.html` exists
2. If yes, exits `0` (no-op)
3. If no, spawns `npm --prefix client run build` synchronously
4. Exits with the child process's exit code on failure

It handles **cross-platform npm resolution** (`process.platform === 'win32' ? 'npm.cmd' : 'npm'`). This ensures the server never starts with a missing client build — even on first deploy.

---

### SPA Routing with Negative Lookahead

The client is served via a regex-based catch-all that uses a **negative lookahead** to avoid intercepting API routes:

```ts
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});
```

`/(?!api).*/` matches any path that does **not** start with `/api`. This gives React Router full control of client-side routing while keeping `/api/*` routes handled by Express.

---

### API Versioning

All routes are mounted at **two path prefixes** simultaneously:

```ts
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/v1/auth', authRouter);      // versioned
app.use('/api/v1/products', productRouter); // versioned
```

This allows a future `/api/v2` to coexist alongside the current implementation with zero breaking changes.

---

### Express Request Augmentation

The `types/express.d.ts` file uses **TypeScript declaration merging** to augment the Express `Request` interface globally:

```ts
declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      _queryDefaults?: Record<string, string>;
      user?: Document & {
        _id: unknown;
        id?: string;
        name?: string;
        email?: string;
        role?: string;
        correctPassword?: (...) => Promise<boolean>;
        changedPasswordAfter?: (JWTTimestamp: number) => boolean;
        createPasswordResetToken?: () => string;
      };
    }
  }
}
```

This gives full type safety on `req.user`, `req.requestTime`, and `req._queryDefaults` across the entire server codebase without any casting at the callsite.

Third-party modules without TypeScript declarations (`express-mongo-sanitize`, `hpp`, `xss-clean`) are shimmed via `types/shims.d.ts` with minimal `(...args: any[]) => any` declarations.

---

### Transactional Email via SMTP

Password reset emails are sent via Nodemailer with a configurable SMTP transport. The transport factory supports **multiple environment variable naming conventions** — falling back through `EMAIL_*`, `MAILTRAP_*`, and generic `Username`/`Password` keys:

```ts
const username = process.env.EMAIL_USERNAME || process.env.MAILTRAP_USERNAME || process.env.Username;
const password = process.env.EMAIL_PASSWORD || process.env.MAILTRAP_PASSWORD || process.env.Password;
```

This ensures compatibility with Mailtrap's Render environment variable naming without requiring manual remapping. The `EMAIL_FROM` field defaults to `Local Marketplace <no-reply@local-marketplace.test>`.

In development, the reset token is included in the API response for easy testing. In production, it's sent only via email (`resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken`).

---

### Request Timestamping

Every request has its arrival time stamped as ISO 8601 and attached to `req.requestTime`:

```ts
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
```

This is available to any downstream handler for audit logging, response headers, or debugging.

---

### Lazy Database Connection per Request

API routes use an `ensureDatabaseConnection` middleware that calls `connectDB()` on every request:

```ts
const ensureDatabaseConnection = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
};

app.use('/api', ensureDatabaseConnection);
```

Because `connectDB()` uses the `globalThis` cache, this is a no-op for subsequent requests (returns the cached connection). But if the connection drops, the next request will automatically reconnect — no server restart needed.

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Runtime | Node.js 22+ | Top-level `await`, ESM native |
| Language | TypeScript 6 (server) / 5 (client) | Full-stack type safety |
| Server | Express 5 | Async middleware, promise-based routing |
| Database | Mongoose 9 + MongoDB | Schema validation, virtuals, hooks, aggregation |
| Auth | jsonwebtoken 9 + bcryptjs 3 | JWT issuance/verification, bcrypt hashing |
| Email | Nodemailer 8 | SMTP transport for password resets |
| Bundler | Vite 7 + `@vitejs/plugin-react` | HMR, optimized production builds |
| Frontend | React 19 + React Router 7 | Automatic JSX transform, typed routing |
| Executor | tsx 4 | TypeScript execution without compilation |

---

## Getting Started

### Prerequisites

- **Node.js** 22 or later (required for top-level `await` in ESM)
- **MongoDB** — local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- **SMTP** credentials for password reset emails ([Mailtrap](https://mailtrap.io) recommended for development)

### Installation

```bash
git clone https://github.com/your-username/marketplace.git
cd marketplace

npm install                    # server dependencies
npm --prefix client install    # client dependencies
```

### Configuration

```bash
cp config.env.example config.env
```

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<username>:<PASSWORD>@cluster.mongodb.net/marketplace
DATABASE_PASSWORD=your_db_password
JWT_SECRET=your_secret_minimum_32_chars_long
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password
```

### Seed Data

```bash
npm run data:import    # Load 15 sample products across 7 categories
npm run data:delete    # Clear all products
```

### Run

```bash
npm run start:dev      # Server with file watching (tsx watch)
npm run client:dev     # Client with Vite HMR
npm start              # Production (auto-builds client if missing)
```

---

## API Reference

### Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | — | Create account, returns JWT |
| `POST` | `/api/auth/register` | — | Alias for signup |
| `POST` | `/api/auth/login` | — | Authenticate, returns JWT |
| `GET` | `/api/auth/logout` | — | Clears JWT cookie |
| `POST` | `/api/auth/forgotPassword` | — | Sends reset token via email |
| `PATCH` | `/api/auth/resetPassword/:token` | — | Resets password with token |
| `GET` | `/api/auth/me` | JWT | Current user profile |
| `PATCH` | `/api/auth/updateMe` | JWT | Update name/email/photo |
| `PATCH` | `/api/auth/updateMyPassword` | JWT | Change password |
| `DELETE` | `/api/auth/deleteMe` | JWT | Soft-delete account |

### Product Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/products` | JWT | List all (filterable, sortable, paginated) |
| `GET` | `/api/products/:id` | JWT | Single product by ID |
| `POST` | `/api/products` | Admin | Create product |
| `PATCH` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/products/top-3-cheapest` | JWT | 3 cheapest products (aliased query) |
| `GET` | `/api/products/product-category` | JWT | Aggregated stats per category |

> All endpoints also available under `/api/v1/` for versioned access.

### Query Parameters

```
?price[gte]=100&price[lte]=500    Filtering (gte, gt, lte, lt)
?sort=price,-postedDate           Multi-field sorting
?fields=name,price,seller         Field projection
?page=2&limit=10                  Pagination
?category=Electronics             Exact match filtering
```

---

## Project Structure

```
marketplace/
├── app.ts                          Express app (middleware pipeline, routes)
├── server.ts                       Entry point (DB connect, graceful shutdown)
├── import-dev-data.ts              CLI seeder (--import / --delete)
├── render.yaml                     Render deployment blueprint
├── config.env.example              Environment variable template
│
├── controllers/
│   ├── authController.ts           Signup, login, password reset, profile CRUD
│   ├── productController.ts        Product CRUD, aggregation, aliased queries
│   └── errorController.ts          Global error handler (5 error transformers)
│
├── middleware/
│   └── authMiddleware.ts           JWT protect (6-stage pipeline) + restrictTo
│
├── models/
│   ├── productModel.ts             Schema, 5 hooks, cross-context validator, index
│   └── userModel.ts                Schema, bcrypt, soft delete, reset tokens
│
├── routes/
│   ├── authRoutes.ts               Public + protected auth routes
│   └── productRoutes.ts            Protected + admin product routes
│
├── utils/
│   ├── apiFeatures.ts              Chainable query builder (filter/sort/fields/paginate)
│   ├── appError.ts                 Operational error class (statusCode, isOperational)
│   ├── catchAsync.ts               Promise-based async error wrapper
│   └── email.ts                    Nodemailer SMTP transport factory
│
├── db/
│   └── connect.ts                  globalThis-cached MongoDB connection
│
├── types/
│   ├── express.d.ts                Request augmentation (user, requestTime, _queryDefaults)
│   └── shims.d.ts                  Declarations for untyped packages
│
├── scripts/
│   └── ensure-client-build.ts      Pre-start build gate (cross-platform)
│
├── data/
│   └── products.json               15 seed products across 7 categories
│
└── client/                         React 19 + Vite 7 frontend
    ├── src/
    │   ├── components/             AppShell, AuthShell, Skeleton
    │   ├── pages/                  Products, Admin, Profile, Login, Signup, Reset
    │   ├── lib/                    cx utility
    │   ├── data.ts                 UI mock data
    │   ├── types.ts                Frontend type definitions
    │   ├── styles.css              Design system (tokens, components, responsive)
    │   └── App.tsx                 Route definitions
    └── index.html                  Entry point (Inter + Nunito Sans fonts, SEO meta)
```

---

## Deployment

### Render (One-Click)

The included `render.yaml` blueprint configures:
- **Build**: `npm install → client install → npm run build`
- **Start**: `npm start` (runs `prestart` build gate, then `tsx server.ts`)
- **Health check**: `GET /`
- **Environment**: production, with synced secrets for DATABASE, JWT_SECRET, EMAIL_*

### Manual

```bash
npm run build              # Typechecks server + builds client
NODE_ENV=production npm start
```

---

## Authors

**GT1C-MEER**

## License

ISC
