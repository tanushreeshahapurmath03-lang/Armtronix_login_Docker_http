# TODO - Local persistence migration (no backend dependency)

- [ ] Inspect frontend for all backend endpoint paths used via fetch/axios.
- [ ] Implement IndexedDB-backed local storage layer.
- [ ] Implement browser API emulator mapping all used endpoints to local storage.
- [ ] Wrap `window.fetch` in `login_frontend/src/main.jsx` to route `/api/...` requests into emulator.
- [ ] Update `login_frontend/src/api/client.js` so axios uses emulator instead of network.
- [ ] Ensure auth token storage + ProtectedRoute compatibility remain unchanged.
- [ ] Smoke test login + core CRUD flows (claims, payments, tasks, leave, events, attendance).
- [ ] Document run steps + any env changes.

