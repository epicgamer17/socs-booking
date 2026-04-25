# SOCS Booking — Fix Checklist

## 🔴 Pre-demo blockers

- [x] **#1** Fix role mismatch in `groupMeetingsController.js:38` — change `role = 'user'` to `role = 'student'`. Group meeting invitations are otherwise unreachable.
- [x] **#2** Fix wrong URL prefix in `UserDashboard.jsx` — lines 72 and 167 use `/group/...` but server mounts at `/groupMeetings/...`. Student voting is 404'ing.
- [x] **#4** Add `UNIQUE(slotID, userID)` to `bookings` migration + `FOR UPDATE` on slot SELECT in `bookSlot`. Prevents double-booking race during Phase 2 tryout.
- [ ] **#5** Add `// Author: <name>` headers to every `.js`/`.jsx` file your team wrote. Spec page 5 explicitly grades this.
- [ ] **#6** Pick an actual app name (not "SOCS Booking"). Update `index.html`, `LandingPage.jsx`, `NavBar.jsx`, `README.md`.
- [x] **#9** Fix `slotsController.deleteSlot:161` — message says "Booking ... cancelled" even when nothing was booked.
- [] **#15** Deploy to Mimi. Submission requires a live URL.
- [ ] **#17** `bookSlot` leaves transactions open on early returns at lines 41 and 52. Move verification queries before `beginTransaction()`. Audit other transactional controllers.
- [x] **#28** `NavBar.jsx:47` — desktop nav has no Dashboard link for students. Mirror the mobile menu logic.
- [x] **#33** Add live URL to top of `README.md` once deployed.

## 🟠 Competition track only

- [ ] **#13** Implement `.ics` calendar export. **Mandatory** for competition tier per spec page 4. Add `GET /bookings/export.ics` + download buttons on both dashboards.
- [ ] **#14** Record 5-minute walkthrough with audio. PASS/FAIL gate.
- [ ] **#16** Add HTTPS. Required by competition's "secure website" bonus, and your JWTs leak over plain HTTP.

## 🟡 Code quality (graded under "Quality of coding")

- [x] **#3** Standardize role label as `student` everywhere — DB, JWT, frontend localStorage, all comparisons. Currently `auth.jsx:20` uses `"user"`.
- [ ] **#8** Make Type 1 meeting request flow consistent — server should build `mailtoUrl` for owner notifications, matching the `bookSlot`/`cancelBooking` pattern.
- [ ] **#10** `/dashboard/student` duplicates `bookingsController.viewBookings`. Delete one.
- [ ] **#11** `/dashboard/student` doesn't enforce role. Add `requireStudent` or merge into single `/dashboard`.
- [ ] **#12** Document logout limitation in README (JWT not actually invalidated until expiry).
- [ ] **#18** `getOwners` in `slotsController.js:7-15` selects ungrouped columns. Add to `GROUP BY` or wrap in `MAX()`.
- [ ] **#19** `getOwners` mutates DB on a GET. Move invite token creation to registration time.
- [x] **#20** `auth.jsx:96` typo — comma should be semicolon.
- [x] **#21** Delete leftover `console.log(r)` in `auth.jsx:59`. Grep for others.
- [ ] **#22** Document SQL `;`-splitting limitation in `migrate.js`.
- [ ] **#24** Restrict CORS to deployed origin instead of `app.use(cors())`.
- [ ] **#25** Add `UNIQUE(ownerID)` to `inviteLinks` migration.
- [ ] **#26** Lowercase emails before insert/lookup in `authController`.
- [ ] **#27** Defensive null checks before `.trim()` on req body fields. Currently 500s on missing fields.
- [x] **#29** `DirectoryPage.jsx:74` — move `document.title` assignment into a `useEffect`, stop assigning inside JSX.
- [ ] **#30** `slotsController.deleteSlot` should return `mailtoUrl` server-side instead of frontend building an empty one.
- [ ] **#31** `createRecurringSlots` uses `toISOString().split("T")[0]` — timezone-drifts dates. Use UTC math like `CalendarSelector.jsx:10`.

## 🟡 Required-feature gaps

- [ ] **#7** Add "How it works" section to landing page or a `/help` route. Spec requires "basic operation instructions."

## 🟢 Submission hygiene

- [ ] **#23** Commit `.env.example` files for both server and client.
- [ ] **#32** Expand 30% attribution table in README. Be conservative — list react-router, vite, eslint, all libs, any AI-assisted helpers.
- [ ] **#34** Rewrite team table's "Features Worked On" as file path lists. Pair with #5 so the TA's grep matches.
- [ ] **#35** README task list out of date. `/slots/recurring` is unused dead code (frontend loops `/slots/create` instead). Either wire it up or delete it.
- [x] **#36** Add `*.pdf` to `.gitignore`, `git rm --cached` the project PDF. Optional.

---

**Fix order if time-crunched:** #2 → #1 → #5 → #4 + #17 (same code path) → #9 → #28 → #6 → #15 → #33. Then competition items if applicable. Then code quality.
