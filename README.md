# MaragondonOne
Terminal 1: cd server && npm install && npm test && npm start   (API :4000)
Terminal 2: cd client && npm install && npm run dev            (UI :5173, proxies /api -> :4000)
POST /api/dispatch/evaluate-all {tickets?, config?:{rrQuantum,mlqPreset,mlfqPreset,mlfqQ1,mlfqQ2,mlfqAging}}
Also: POST /api/dispatch/evaluate/:algorithm, GET /api/datasets, GET /api/datasets/:id/load, CRUD /api/tickets
Client tests: cd client && npm test (renders the UI against the real API)
Barangays: client/src/config/municipal.js (24 supplied names; verify and add the missing official ones).
Persistence: tickets are saved to server/data/tickets.json when run via `npm start` (tests never write to disk).
Staff PIN: set STAFF_PIN (see server/.env.example) to require the PIN for edit/delete/dataset loading; enter it in the Dispatch Center.
Statuses: Queued, In service, Completed, Cancelled (editable by staff).
Command center: status counts (Incoming/Queued/Active/Completed/Urgent) and per-department queues ordered by the selected algorithm's trace. Citizen reports start as "Incoming"; staff triage them to "Queued". Departments live in client/src/config/municipal.js (SERVICES).
Benchmark controls include MLFQ Q1/Q2/aging overrides (blank = preset).
Config: barangays and departments live in server/config/municipal.json (served at GET /api/config). Edit there; no engine or client changes needed.
Citizen "My reports" is remembered per device (localStorage); it is a convenience filter, not authentication.
