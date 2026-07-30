# MODIT

MODIT is a prototype for an AI-first building materials platform tailored for Delhi NCR. It combines product discovery, supplier comparison, bulk quotation workflows, location-based supplier mapping, order tracking, and agentic AI-driven procurement assistance.

## Functional prototype features
- Building material discovery and ordering experience
- Product categories for cement, steel, sand, aggregates, bricks, tiles, sanitary, plumbing, electrical, paint, hardware, plywood, glass, tools, and finishing materials
- Supplier and location-based mapping for Delhi NCR
- Price comparison and bulk quotation requests
- A connected procurement run: requirement brief → calculated BOM → supplier offers → RFQ → confirmed purchase order
- Persistent RFQ, order and activity records stored in `data/modit-store.json`
- Supplier-side delivery status updates and GST-invoice-draft workflow
- Voice capture through the browser Web Speech API where supported

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the app:
   ```bash
   npm start
   ```
3. Open:
   - http://localhost:3000
   - http://localhost:3000/agentic-ai
   - http://localhost:3000/dashboard

## Project structure
- server.js: Express server, workflow APIs and persistent local-store adapter
- views/: EJS page templates
- public/css/style.css: UI styling

## Production deployment note

This repository now provides a working vertical slice rather than static panels. It deliberately uses a local JSON store so it runs with no external services. Before a public production launch, replace that adapter with Postgres, add user/supplier authentication and role-based access, connect a payment/BNPL provider and logistics partner, store uploads in object storage, and connect the AI endpoints to a governed model provider with audit logs and human approval limits for pricing or order submission.
