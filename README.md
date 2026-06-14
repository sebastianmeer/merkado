# Marketplace

A local marketplace app with an Express API and a React + TypeScript client.

The frontend has been reset into a skeleton UI shell so the layout, navigation, and loading states are ready before the real data work lands.

## Structure

- `app.ts`, `server.ts`: Express app bootstrap and HTTP server entrypoint
- `controllers/`, `models/`, `routes/`, `db/`, `middleware/`, `utils/`: backend API code
- `client/`: React frontend built with Vite and TypeScript

## Frontend

The client now uses:

- React 19
- React Router
- TypeScript
- Vite

Pages currently included:

- Products
- Admin
- Account
- Login
- Signup
- Reset password

## Setup

Install dependencies:

```bash
npm install
npm --prefix client install
```

Create your local env file from the example:

```bash
copy config.env.example config.env
```

Then fill in the private values for your database, JWT, and email settings.

## Run

Start the API:

```bash
npm start
```

`npm start` now builds `client/dist` automatically if it is missing, then starts the server.

Start the client:

```bash
npm --prefix client run dev
```

Build the client:

```bash
npm --prefix client run build
```

## Notes

- `config.env` stays local and is ignored by git.
- `config.env.example` is the checked-in template for backend variables.
- The client does not currently require a local env file.
- Generated folders such as `node_modules`, `client/dist`, and Playwright session data are ignored and should stay out of version control.
