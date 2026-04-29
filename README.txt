================================================================================
  myBookings - COMP 307 Winter 2026 Team Project (Group 12)
  Project Type: SOCS Booking Application - Competition Project

  This README.txt is a shared submission. All four team members
  agreed on the contents, including the contribution breakdown in
  section 6, and each of us is submitting this same file under our
  own MyCourses account.
================================================================================


--------------------------------------------------------------------------------
  1. LIVE URL
--------------------------------------------------------------------------------

  https://winter2026-comp307-group12.cs.mcgill.ca/

  NOTE: The site is hosted on Mimi (SOCS server). Access requires either:
    - Being on the McGill campus network, OR
    - Being connected to the McGill VPN.

  GitHub repository (optional, included per instruction #4):
  https://github.com/epicgamer17/socs-booking


--------------------------------------------------------------------------------
  2. TEAM MEMBERS
--------------------------------------------------------------------------------

  Name                         | McGill ID    | Role
  -----------------------------|--------------|------------------------
  Sophia Hussain               | 2611418580    | Team Leader / Backend
  Thomas Nguyen                | 261181634    | Backend
  Jonathan Lamontagne-Kratz    | 261143892    | Frontend / Design
  Tanav Bansal                 | 261075755    | Frontend / Design


--------------------------------------------------------------------------------
  3. TECH STACK
--------------------------------------------------------------------------------

  Database : MariaDB (SQL)
  Backend  : Node.js + Express 5 (port 3000)
  Frontend : React 19 + Vite (dev port 5173, production bundle served
             by the same Express process)
  Auth     : JWT (jsonwebtoken) signed with HS256, delivered as an
             httpOnly + secure + sameSite=strict cookie named "token";
             1-hour expiry. bcrypt for password hashing. Email
             verification required before login (token sent via SMTP).
  Email    : mailto: links for user-initiated messaging (per spec) +
             nodemailer / Gmail SMTP for server-side notifications
             (booking cancellations, meeting accept/decline, group
             meeting finalisation, email-verification link).
  Calendar : ical-generator for .ics export (GET /calendar/export)
  Security : helmet (HTTP security headers), express-rate-limit on
             /auth/register and /auth/login (10 req / 15 min / IP),
             CORS restricted to FRONTEND_URL with credentials:true,
             httpOnly cookie auth, HTTPS terminated by Apache on Mimi.


--------------------------------------------------------------------------------
  4. HOW TO RUN THE CODE  (READ THIS BEFORE GRADING)
--------------------------------------------------------------------------------

  *** EASIEST WAY TO GRADE: Just open the live URL above in a browser
      (while on McGill VPN or campus network). The site is already deployed
      and running on Mimi. No setup required. ***

  If you want to run the code locally from the source submission, follow
  these steps. The submitted source tree assumes this directory layout:

      app/
       |-- server/    (Node.js + Express backend)
       |-- client/    (React + Vite frontend)
       |-- README.txt (this file)


  --- 4.1  PREREQUISITES ---

      - Node.js   v18 or newer (tested on v20)
      - npm       v9 or newer
      - MariaDB   v10.6 or newer  (or MySQL 8.x)

      A MariaDB user and an empty database must exist before starting
      the backend. The credentials below are read from app/server/.env.


  --- 4.2  ENV FILES ---

      Two .env files are needed:  app/server/.env  AND  app/client/.env.

      ============================================================
      app/server/.env
      ============================================================

          # --- Database (MariaDB / MySQL, default port 3306) ---
          DB_HOST=localhost
          DB_USER=cs307-user
          DB_PASSWORD=<your-db-password>
          DB_NAME=cs307

          # --- Auth ---
          JWT_SECRET=<any-long-random-string>

          # --- Server port (optional, defaults to 3000) ---
          PORT=3000

          # --- Frontend origin ---
          # Used for: (1) the CORS allow-origin header, and (2) the
          # base URL embedded in the email-verification link and
          # owner invite links. In dev: http://localhost:5173.
          # In prod on Mimi: https://winter2026-comp307-group12.cs.mcgill.ca
          FRONTEND_URL=http://localhost:5173

          # --- SMTP notifications (Gmail) ---
          # Used by lib/mailer.js for booking/meeting notifications
          # AND by authController.js for the email-verification link
          # sent during registration. Use a Gmail App Password, NOT
          # your real Gmail password.
          EMAIL_USER=<your-gmail-address>
          EMAIL_PASS=<gmail-app-password>

      ============================================================
      app/client/.env
      ============================================================

          # Backend base URL for fetch() calls from the React app.
          # Must match where the backend is listening.
          # In dev:  http://localhost:3000
          # In prod: https://winter2026-comp307-group12.cs.mcgill.ca
          VITE_API_URL=http://localhost:3000


  --- 4.3  INSTALL DEPENDENCIES ---

      In two separate terminals (or one after the other):

          cd app/server
          npm install

          cd app/client
          npm install


  --- 4.4  CREATE & MIGRATE THE DATABASE ---

      1) Log in to MariaDB and create the empty database:

             mysql -u root -p
             > CREATE DATABASE cs307;
             > CREATE USER 'cs307-user'@'localhost' IDENTIFIED BY '<password>';
             > GRANT ALL ON cs307.* TO 'cs307-user'@'localhost';
             > EXIT;

      2) Run the migration script. This reads every file inside
         app/server/db/migrations/ in alphabetical order and creates
         all tables (users, slots, bookings, meetingRequests,
         groupMeetings, inviteLinks):

             cd app/server
             npm run migrate

         Equivalent to:    node db/migrate.js


  --- 4.5  START THE BACKEND ---

      cd app/server
      npm start
      # or for auto-reload during dev:  npm run dev

      The API will listen on  http://localhost:3000


  --- 4.6  START THE FRONTEND (DEV MODE) ---

      cd app/client
      npm run dev

      Open  http://localhost:5173  in a browser.

      The frontend reads its backend URL from VITE_API_URL in
      app/client/.env (see 4.2). All fetches are sent with
      `credentials: 'include'` so the browser ships the auth cookie
      back to the API. Make sure the backend is running first and
      that FRONTEND_URL on the backend matches http://localhost:5173,
      otherwise CORS will reject the requests.


  --- 4.7  PRODUCTION BUILD (OPTIONAL) ---

      cd app/client
      npm run build

      This emits a static bundle to app/client/dist/. On Mimi we serve
      this bundle directly from Express (the same Node process on
      port 3000), so a single `npm start` from app/server runs the
      whole site. To do the same locally:

          cd app/server
          NODE_ENV=production npm start

      Then open  http://localhost:3000  (no separate Vite server).


  --- 4.8  RUNNING ON MIMI (REFERENCE FOR THE TA) ---

      The deployed copy on Mimi is started with:

          ssh winter2026-comp307@mimi.cs.mcgill.ca
          cd socs-booking/app/server
          npm start

      HTTPS is terminated by Apache reverse-proxy in front of Node.


  --- 4.9  TEST ACCOUNTS ---

      Registration is open to any email matching:
        - @mcgill.ca       (becomes an OWNER - prof / TA)
        - @mail.mcgill.ca  (becomes a STUDENT)

      Password rules enforced server-side: 12-72 chars, at least one
      uppercase, one digit, and one symbol from [!@#$%^&*].

      Registration always sends a real verification email through
      Gmail SMTP (authController.js). EMAIL_USER / EMAIL_PASS must
      be set for the user to receive the link, and the user must
      click it before they can log in (login is blocked with HTTP 403
      until isVerified = TRUE in the users table).

      For grading without setting up SMTP, you can skip the email
      step by manually flipping the verification flag in the DB:

          mysql> USE cs307;
          mysql> UPDATE users SET isVerified = TRUE
                  WHERE email = 'your.test.email@mcgill.ca';

      The deployed copy on Mimi has SMTP configured; registering
      against the live URL will send a real email.


--------------------------------------------------------------------------------
  5. CONTRIBUTION STATEMENT  (agreed by all four team members)
--------------------------------------------------------------------------------

  All four members reviewed and agreed to the breakdown below before
  submission. Per-file authorship matches the `// Author:` headers
  written into the source. The TA can verify with:

      grep -rn "Author" app/server app/client/src


  --- 5.1  Role split ---

      Sophia Hussain (Team Leader, Backend)
          Auth backbone (registration, email verification, JWT
          middleware), slots, meeting requests, invite links, all
          users/slots/meetingRequests/inviteLinks migrations, .ics
          calendar export, security review.

      Thomas Nguyen (Backend)
          Login / logout, bookings, dashboard handlers, Type-2 group
          meetings (calendar method end-to-end), bookings + group-
          meetings migrations, transaction and race-condition audit,
          various security hardening (CORS, helmet, cookie-based auth,
          rate limiting).

      Jonathan Lamontagne-Kratz (Frontend / Design)
          Owner Dashboard, UI component library (Button, Input,
          ThemeToggle), global styling, theme system, NavBar, the
          auth-aware fetch wrapper, and the cookie-based auth context.

      Tanav Bansal (Frontend / Design)
          Landing Page, Register, Login, Directory, Booking, and
          User Dashboard pages, MailtoButton component, departments
          data, ProtectedRoutes wrapper, polish.


  --- 5.2  File-level authorship ---

      Each .js / .jsx / .sql file in the project has a `// Author: ...`
      header. The breakdown below is grouped by team member; files
      with multiple names in their header appear under each
      contributor with a percentage estimate.

      --- Sophia Hussain ---
          server/index.js                                  ~50%  (with Thomas)
          server/controllers/authController.js             ~50%  (registration
                                                                 + verify email)
          server/controllers/slotsController.js            ~90%
          server/controllers/meetingRequestsController.js  ~90%
          server/controllers/inviteLinkController.js       100%
          server/controllers/calendarController.js         ~90%  (~10% AI fixes)
          server/middleware/authMiddleware.js              100%
          server/routes/auth.js                            ~60%  (with Thomas)
          server/routes/slots.js                           100%
          server/routes/meetingRequests.js                 100%
          server/routes/inviteLink.js                      100%
          server/routes/calendar.js                        100%
          server/db/db.js                                  ~50%  (with Thomas)
          server/db/migrations/01_users.sql                100%
          server/db/migrations/02_slots.sql                100%
          server/db/migrations/04_meetingRequest.sql       100%
          server/db/migrations/06_inviteLinks.sql          100%

      --- Thomas Nguyen ---
          server/index.js                                  ~50%  (with Sophia;
                                                                 lines 45-56 AI)
          server/controllers/authController.js             ~50%  (login, logout,
                                                                 JWT issue)
          server/controllers/bookingsController.js         100%
          server/controllers/dashboardController.js        100%
          server/controllers/groupMeetingsController.js    ~85%  (lines 96-144
                                                                 AI-drafted)
          server/controllers/slotsController.js            ~10%  (deleteSlot fix
                                                                 + transaction
                                                                 audit only)
          server/controllers/meetingRequestsController.js  ~10%  (txn audit +
                                                                 sendNotification
                                                                 wiring only)
          server/middleware/ownerMiddleware.js             100%
          server/routes/auth.js                            ~40%  (with Sophia;
                                                                 logout route)
          server/routes/bookings.js                        100%
          server/routes/dashboard.js                       100%
          server/routes/groupMeetings.js                   100%
          server/lib/queryHelpers.js                       ~70%  (with Jonathan;
                                                                 SQL bodies +
                                                                 logic; names
                                                                 AI-suggested)
          server/db/db.js                                  ~50%  (with Sophia)
          server/db/migrations/03_bookings.sql             100%  (incl.
                                                                 UNIQUE(slotID,
                                                                 userID))
          server/db/migrations/05_groupMeetings.sql        100%
          checklist.md                                     100%  (now stale)

      --- Jonathan Lamontagne-Kratz ---
          server/lib/queryHelpers.js                       ~30%  (with Thomas;
                                                                 helper-shape
                                                                 review)
          client/src/App.jsx                               ~50%  (with Tanav)
          client/src/OwnerDashboard.jsx                    100%
          client/src/VerifyEmail.jsx                       100%
          client/src/components/CalendarSelector.jsx       100%
          client/src/components/GroupMeetingForm.jsx       100%
          client/src/components/NavBar.jsx                 100%
          client/src/components/ThemeToggle.jsx            100%
          client/src/components/ui/Button.jsx              100%
          client/src/components/ui/Input.jsx               100%
          client/src/utils/api.js                          100%  (fetchWithAuth)
          client/src/utils/OwnerRoute.jsx                  100%
          client/src/utils/theme.jsx                       100%
          client/src/Register.jsx                          ~25%  (with Tanav;
                                                                 styling only)
          client/src/DirectoryPage.jsx                     ~20%  (with Tanav;
                                                                 styling +
                                                                 auth fetch)
          client/src/BookingPage.jsx                       ~20%  (with Tanav;
                                                                 auth fetch)
          client/src/UserDashboard.jsx                     ~20%  (with Tanav;
                                                                 useAutoRefresh
                                                                 + auth fetch)
          client/src/utils/auth.jsx                        ~20%  (with Tanav;
                                                                 cookie wrapper
                                                                 + AuthContext)
          client/src/LandingPage.jsx                       ~30%  (with Tanav +
                                                                 AI; styling)
          all client CSS modules + Auth.module.css         100%

      --- Tanav Bansal ---
          client/src/App.jsx                               ~50%  (with Jonathan)
          client/src/LandingPage.jsx                       ~50%  (with Jonathan;
                                                                 page structure;
                                                                 prose AI)
          client/src/Register.jsx                          ~75%  (with Jonathan;
                                                                 page logic)
          client/src/login.jsx                             100%
          client/src/DirectoryPage.jsx                     ~80%  (with Jonathan)
          client/src/BookingPage.jsx                       ~80%  (with Jonathan)
          client/src/UserDashboard.jsx                     ~80%  (with Jonathan)
          client/src/components/CalendarSelectorBooking.jsx 100%
          client/src/components/ui/MailtoButton.jsx        100%  (one AI line)
          client/src/utils/auth.jsx                        ~80%  (with Jonathan)
          client/src/utils/departments.jsx                 100%  (data via AI)
          client/src/utils/ProtectedRoutes.jsx             100%

      --- Not human-authored (kept here for completeness) ---
          server/db/migrate.js                              AI Generated Script
          server/lib/mailer.js                              "Author: Claude"
          client/src/utils/useAutoRefresh.jsx               "Author: AI"


  --- 5.3  How to verify ---

      The clearest way to audit who wrote what is to grep for
      `Author` headers in the source tree:

          grep -rn "Author" app/server app/client/src \
              | grep -v node_modules

      Every .js / .jsx / .sql file the team wrote has one. Files
      with no Author header (or marked "Author: Claude" / "Author:
      AI") are listed in section 7.2 under the AI attribution.


--------------------------------------------------------------------------------
  6. CODE / CONTENT NOT WRITTEN BY THE TEAM  (the "30% rule")
--------------------------------------------------------------------------------

  Per the spec (page 5), at least 70% of the project must be hand-coded.
  Below is a complete list of what was NOT hand-written by us, separated
  by source. Nothing here is load-bearing application logic; the AI
  contributions are utility helpers and one merge-conflict resolution.


  --- 6.1  Open-source libraries (npm packages) ---

      Backend:
          express              -  HTTP server framework
          mysql2               -  MariaDB driver
          jsonwebtoken         -  JWT signing/verification
          bcrypt               -  password hashing
          cookie-parser        -  cookie middleware
          cors                 -  CORS middleware
          helmet               -  HTTP security headers
          express-rate-limit   -  brute-force protection on /auth
          dotenv               -  .env loader
          uuid                 -  in package.json but unused; invite
                                   tokens come from Node's built-in
                                   `crypto.randomBytes(32).toString("hex")`
          ical-generator       -  .ics calendar export
          nodemailer           -  Gmail SMTP transport used by
                                   lib/mailer.js for server-sent
                                   notification emails

      Frontend:
          react, react-dom     -  UI framework
          react-router-dom     -  client-side routing
          vite                 -  dev server / bundler
          eslint + plugins     -  linting (dev only)


  --- 6.2  AI-assisted code (Claude / ChatGPT) ---

      app/server/db/migrate.js
          AI-generated short utility script that reads every .sql file
          in db/migrations/ and runs them in order. ~50 lines.

      app/server/lib/mailer.js
          AI-written nodemailer wrapper. Configures a Gmail SMTP
          transport and exposes a sendNotification() helper that
          fire-and-forgets booking/meeting notification emails.
          Used by slotsController, bookingsController,
          meetingRequestsController, and groupMeetingsController.
          ~28 lines.

      app/client/src/utils/useAutoRefresh.jsx
          AI-written React hook that polls dashboard data on a fixed
          interval. ~25 lines.

      app/server/lib/queryHelpers.js  (function NAMES only)
          The names of the exported functions in this file were
          AI-generated - we asked Claude to suggest consistent,
          readable names for the query helpers. The implementations
          (SQL strings and JS logic) are hand-written by us.

      app/client/src/components/ui/MailtoButton.jsx (one line)
          The expression
              params.toString().replace(/\+/g, "%20")
          for URL-encoding mailto bodies came from Claude.

      app/client/src/utils/departments.jsx
          The DEPARTMENT_OPTIONS constant - Claude converted the McGill
          Minerva department list from HTML into a JSON object. The
          data itself is McGill's; the conversion was AI-assisted.

      app/server/db/migrations/05_groupMeetings.sql
          AI helped resolve a merge conflict after master was merged
          into the feature branch. Schema content is ours; the
          conflict resolution was AI-assisted.

      app/server/index.js  (lines 45-56)
          The block bracketed by "BEGIN: AI-generated code" / "END:
          AI-generated code" is AI-written. It serves the built
          React bundle from app/client/dist and adds the SPA
          fallback so React Router URLs work after refresh in
          production. ~10 lines.

      app/server/controllers/groupMeetingsController.js
          (lines 96-144, marked "AI FROM 96 to 144")
          The body of getOwnerGroupMeetings, viewInvitations, and
          the first half of submitAvailabilityVote (validation and
          authorisation checks) were drafted by Claude. Thomas
          refactored and integrated them; Claude wrote the initial
          version.

      app/server/controllers/calendarController.js
          The .ics integration is mostly Sophia's, with several
          lines marked "// AI FIX" inline. Claude fixed: switching
          from the deprecated `ical` API to `ICalCalendar`, parsing
          the date column when it returns as a JS Date, and the
          start/end Date construction. ~10 of the ~80 lines.

      app/server/routes/auth.js  (lines 8-17)
          The `rateLimit({...})` config block was pasted verbatim
          from the express-rate-limit npm package's README example.
          Bracketed in the file with "BEGIN: code pasted from ... /
          END: code pasted from ...".

      app/client/src/LandingPage.jsx  (Help section text)
          The user-facing wording of the "How it works" / Help
          section was generated by Claude from a short markdown
          outline Thomas wrote. Page structure and styling are
          Tanav's and Jonathan's; only the prose is AI-generated.

      McGill colour palette
          The hex values used throughout the CSS modules were
          suggested by Claude based on McGill's brand guidelines.

      README.md
          Initial outline / formatting of the project README was
          AI-generated; the content (team table, routes, task list)
          is ours.