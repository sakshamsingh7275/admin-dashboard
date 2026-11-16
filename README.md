# Admin Dashboard – User Analytics & CSS Generator

React (Vite) frontend + Node/Express backend. Data persists in `server/data/db.json`.

## Run locally (Node 18+)
```bash
npm run install:all     # installs root, server and client dependencies
npm run dev             # API on :4000, web app on http://localhost:5173
```
Or in two terminals: `npm --prefix server start` and `npm --prefix client run dev`.
The first start seeds 400 sample requests, so charts are populated immediately.

## Structure
```
server/  index.js (routes, validation, stats) · geo.js (IP→country) · css.js (CSS generator) · store.js (JSON persistence)
client/src/  App.jsx · api.js · hooks.js · theme.js · styles.css
  components/ Layout, ui (tables, cards, flags), Charts
  pages/      Overview, Analytics, IpLookup, Simulator, CssGenerator, Settings
```

## API
GET /api/stats?range=today|7d|30d · GET /api/requests?range&q&country&limit · POST /api/simulate {count}
GET /api/geo/:ip · GET /api/countries · GET|PUT /api/theme · POST /api/css/preview · POST /api/css/download
GET|PUT /api/settings · POST /api/seed · DELETE /api/requests
