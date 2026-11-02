# Working rules for this repo (Levotrade UI)

The owner is a designer, not a developer. Explain things simply (Roman Urdu is fine) and do the technical work yourself.

## How the code is set up — keep it this way
- Screens are designed on the Claude Design canvas. The source files are in `canvas-source/` (`Prototype.dc.html` drives every screen).
- The pages at the repo root (`index.html`, `home.html`, `proforma-invoice.html`, `pi-detail.html`, `complete-pi.html`, `add-pi*.html`, `edit-pi.html`) are **generated** by `node scripts/build.mjs`. Never edit them by hand.
- They run in any browser with no canvas runtime: React from `vendor/`, the design system from `ds/levotrade/`, and `runtime/levo-runtime.js` renders the canvas markup. This is the setup that imports correctly into Figma (code layers / html.to.design). Do **not** go back to shipping raw `.dc.html` files that need `support.js`.
- After any design change: update the canvas, copy `Prototype.dc.html` into `canvas-source/`, run `node scripts/build.mjs`, open the pages in a browser to check, then commit and push to `main`.
- When the design system updates, refresh `ds/levotrade/` (tokens.css, tokens.json, components/bundle.css, components/bundle.js) as well.

## Design rules
- Always use the Levotrade design system components and follow it strictly.
- **Page width:** only **form** pages (`lt-form`) and **detail** pages (`lt-container`) are centred with a max width on big screens. Home/dashboard and table/list pages use the full width (`lt-container lt-container--full`).
- **Back button:** every detail and form page has a back arrow. It must go to the page the user actually came from (screen history via `goBack`), falling back to the parent list when there is no history.
- Top bar runs edge to edge; the sidebar is full screen height.
