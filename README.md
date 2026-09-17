# Lumen

Lumen is a polished, local-first personal finance dashboard for tracking income, expenses, accounts, and cash flow without a backend or account setup.

![Lumen dashboard](https://placehold.co/1200x700/101527/f4f5fb?text=Lumen+Personal+Finance)

## What is included

- Responsive dashboard with animated cash-flow bars, spending donut, sparkline, hover states, and modal transitions.
- Summary cards for income, expenses, net cash flow, and total balance.
- Add income or expense transactions with date, description, account, and category.
- Search, filter by type/category, and sort the transaction table by every column.
- Add accounts with a type and opening balance.
- Add custom income and expense categories.
- Edit or delete transactions, with account balances adjusted automatically.
- Dedicated `transactions.html` page for reviewing and updating the full ledger.
- Persistent light and dark theme toggle.
- Default accounts and categories are seeded for a useful first view.
- Data persists automatically in the browser's `localStorage`; no server or account is required.
- Mobile layout for smaller screens and keyboard-friendly native form controls.

## Run locally

This is a dependency-free static app. You can open [`public/index.html`](./public/index.html) directly in a browser. For the best browser behavior, serve the project root with the included Node.js server:

```powershell
node server.js
```

Then visit `http://localhost:5173`.

Node.js is available from [nodejs.org](https://nodejs.org/) if it is not installed. Python is not required.

## Project structure

| File | Purpose |
| --- | --- |
| `public/index.html` | Dashboard structure, tables, and modal forms |
| `public/transactions.html` | Full-page transaction ledger with edit/delete controls |
| `src/styles.css` | Responsive dark theme, visual system, charts, and animations |
| `src/app.js` | State, localStorage persistence, rendering, filtering, sorting, and form actions |
| `server.js` | Optional zero-dependency local server for development |

## Data model

The browser state contains `accounts`, `categories`, and `transactions`. Each transaction references an account and category by ID, so the UI can safely rename or display related records without duplicating data.

## Notes

This frontend is intentionally local-first. For a production release, add authenticated server-side storage, validation at the API boundary, encrypted backups, and a proper database before storing sensitive financial information.

## License

MIT
