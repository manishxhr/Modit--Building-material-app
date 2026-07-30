# MODIT

MODIT is a Next.js procurement operating system for building materials in Delhi NCR.

## Product workflows

- Search a live material catalog for cement, steel, sand, blocks, tiles, plumbing, electrical and more.
- Create a procurement run in the AI Copilot: site brief → calculated BOM → ranked supplier offers → confirmed order.
- Track the resulting order, delivery status, GST-invoice draft and business-credit concept.
- Onboard a supplier into the local Delhi NCR supplier network.
- Manage orders and workflow activity in Supplier OS.

## Run locally

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

For a production build:

```powershell
npm.cmd run build
npm.cmd run start
```

## Architecture

- `app/`: Next.js App Router pages and Route Handler APIs
- `app/api/`: catalog, AI procurement, RFQ, supplier, order and dashboard APIs
- `lib/store.js`: persistent local data adapter for a zero-configuration demo
- `data/next-store.json`: generated workflow data

## Deployment requirements

This is a complete, runnable product slice. A public production launch should replace the local adapter with Postgres, add user authentication and role-based access, connect real supplier inventory, payment/BNPL and logistics providers, use object storage for BOQ documents, and call a governed AI service with audit logging and approval controls for pricing or purchase orders.
