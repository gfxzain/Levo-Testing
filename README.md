# Levotrade UI — Proforma Invoice flow

Screens for the Levotrade export-trade ERP (Mukhi Noordin & Sons), built on the Levotrade design system.
Every page is plain HTML — open it in any browser, no build step or canvas runtime needed.

## Pages

| Page | Screen |
|---|---|
| `index.html` | Full clickable flow (starts on Home) |
| `home.html` | Home · module quick access |
| `proforma-invoice.html` | Proforma Invoice list |
| `pi-detail.html` | PI Details (read-only) |
| `complete-pi.html` | Complete PI (pre-filled, fields to fill) |
| `add-pi.html` | Add PI (empty form) |
| `add-pi-products.html` | Add PI with products added |
| `add-pi-popup.html` | Add PI with the product pop-up open |
| `edit-pi.html` | Edit PI |

Every page is the same connected flow, just opened on a different screen — click through from any of them.
You can also pick a screen with `index.html?screen=PI%20Detail`.

## Folders

- `ds/levotrade/` — design-system tokens and component bundle
- `runtime/levo-runtime.js` — small renderer that turns the design markup into React
- `vendor/` — React 18.3.1 (MIT)
- `canvas-source/` — original design-canvas files (source of truth; they only run inside the design canvas)
- `scripts/build.mjs` — regenerates the pages from `canvas-source/` (`node scripts/build.mjs`)
