================================================================================
  myBookings - COMP 307 Winter 2026 Team Project (Group 12)
  Submitter: Thomas Nguyen (ID: 261181634)
  Project Type: SOCS Booking Application - Competition Project
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
  Sophia Hussain               | 261418580    | Team Leader / Backend
  Thomas Nguyen                | 261181634    | Backend
  Jonathan Lamontagne-Kratz    | 261143892    | Frontend / Design
  Tanav Bansal                 | 261075755    | Frontend / Design


--------------------------------------------------------------------------------
  3. TECH STACK
--------------------------------------------------------------------------------

  Database : MariaDB (SQL)
  Backend  : Node.js + Express (port 3000)
  Frontend : React 19 + Vite (dev port 5173, production served by Express)
  Auth     : JWT (jsonwebtoken) + bcrypt for password hashing
  Email    : mailto: links (no SMTP server, per spec)
  Calendar : ical-generator for .ics export
  Security : helmet, express-rate-limit, CORS allowlist, HTTPS in production


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


  --- 4.2  BACKEND .env FILE ---

      Create the file  app/server/.env  with the following keys:

          # --- Database ---
          DB_HOST=localhost
          DB_PORT=3306
          DB_USER=cs307-user
          DB_PASSWORD=<your-db-password>
          DB_NAME=cs307

          # --- Auth / Security ---
          JWT_SECRET=<any-long-random-string>
          NODE_ENV=development
          PORT=3000

          # --- CORS allowlist (comma-separated origins) ---
          CLIENT_ORIGIN=http://localhost:5173

      In production on Mimi, NODE_ENV is set to "production" and
      CLIENT_ORIGIN points at the deployed HTTPS origin. The same .env
      keys are used; only the values change.


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

      The frontend dev server proxies API calls to localhost:3000
      via the JWT token stored in localStorage. Make sure the backend
      is running first.


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

      You may register fresh accounts from the landing page. There is
      no email-verification mailer in dev mode, so the verification
      link is logged to the backend console; click it to verify.


--------------------------------------------------------------------------------
  5. WHAT IS DIFFERENT SINCE DEMO 1
--------------------------------------------------------------------------------

  The TA asked us to start Demo 2 by showing what changed. The major
  fixes/additions since Demo 1 are:

   - Fixed group-meeting role mismatch (controller expected role='user'
     while the rest of the app uses 'student'); student voting now works.
   - Fixed wrong URL prefix in UserDashboard (/group/... -> /groupMeetings/...)
     so the student-side voting requests no longer 404.
   - Added UNIQUE(slotID, userID) constraint and SELECT ... FOR UPDATE
     inside the bookSlot transaction to prevent the double-booking race.
   - Repaired bookSlot transactional logic: verification queries now run
     before beginTransaction(), so early returns no longer leak open
     transactions.
   - Standardised the role label as 'student' across DB / JWT / frontend.
   - Added Dashboard link to desktop NavBar (was mobile-only).
   - Renamed app from "SOCS Booking" to "myBookings" across index.html,
     LandingPage, NavBar, and README.
   - Fixed the misleading "Booking ... cancelled" message in
     slotsController.deleteSlot when no booking actually existed.
   - Added .ics calendar export endpoint and download buttons on both
     dashboards (mandatory competition feature).
   - Deployed to Mimi with HTTPS (was HTTP in Demo 1) - JWTs no longer
     leak on the wire.
   - CORS restricted to the deployed origin instead of `cors()` open.
   - Cleaned up stray console.log statements and a typo in auth.jsx.
   - Moved document.title assignment in DirectoryPage into a useEffect.


--------------------------------------------------------------------------------
  6. CONTRIBUTION STATEMENT  (Thomas Nguyen's version)
--------------------------------------------------------------------------------

  Each team member submits their own README.txt with their own version
  of this contribution statement, per the instructor's request. Below
  is my honest account of who built what, based on commit history and
  what we agreed on in our weekly meetings. Percentages are estimates
  for files that more than one of us edited.

  --- 6.1  Role split ---

      Sophia Hussain (Leader, Backend):   auth + slots + meeting-requests
                                          backbone, all migrations,
                                          calendar export, security review.
      Thomas Nguyen (Backend, ME):        login/logout + bookings +
                                          dashboard + Type-2 group meetings,
                                          transaction & race-condition fixes,
                                          various security hardening.
      Jonathan Lamontagne-Kratz (Frontend): Owner dashboard, UI component
                                          library, global styling, auth-aware
                                          fetch layer.
      Tanav Bansal (Frontend):            Landing, Register, Login, Directory,
                                          Booking pages, bonus polish.


  --- 6.2  Files I (Thomas) wrote, by directory ---

      Backend - controllers (app/server/controllers/):
          authController.js          ~50%  (login, logout, JWT issue;
                                            register written by Sophia)
          bookingsController.js      ~80%  (bookSlot, cancelBooking,
                                            viewBookings; Sophia did the
                                            initial scaffold and review)
          dashboardController.js     ~90%  (unified /dashboard handler;
                                            Sophia stubbed the route)
          groupMeetingsController.js 100%  (Type-2 calendar method, vote,
                                            finalise)
          meetingRequestsController.js ~20% (security/transaction fixes;
                                              Sophia wrote the original)
          slotsController.js         ~15%  (deleteSlot fix, transaction
                                            audit; Sophia wrote the rest)

      Backend - routes (app/server/routes/):
          auth.js                    ~40%  (logout route, rate-limit wiring)
          bookings.js                100%
          dashboard.js               ~50%  (shared with Sophia)
          groupMeetings.js           100%

      Backend - db migrations (app/server/db/migrations/):
          03_bookings.sql            100%  (incl. UNIQUE constraint)
          05_groupMeetings.sql       100%

      Backend - lib / middleware:
          lib/queryHelpers.js        ~30%  (group-meeting helpers added by me)
          middleware/authMiddleware.js ~10% (small role-check fixes)

      Backend - entrypoint:
          index.js                   ~30%  (CORS allowlist, helmet wiring,
                                            HTTPS redirect; Sophia wrote
                                            the original bootstrap)

      Frontend (app/client/src/):
          Register.jsx               ~25%  (auth wiring + role handling;
                                            Tanav built the page)
          utils/auth.jsx             ~30%  (token refresh + logout flow;
                                            Tanav/Jonathan wrote the rest)

      Documentation:
          checklist.md               100%  (the pre-demo fix list I drove)
          README.md                  ~25%  (sections covering my code)


  --- 6.3  Files I did NOT write (so the TA can grep my name) ---

      Every .js / .jsx / .sql file authored mainly by me carries an
      `// Author: Thomas Nguyen` header on its first non-shebang line.
      Files where I only made small edits do NOT have that header -
      they belong to whichever teammate is named in their own header.


--------------------------------------------------------------------------------
  7. CODE / CONTENT NOT WRITTEN BY THE TEAM  (the "30% rule")
--------------------------------------------------------------------------------

  Per the spec (page 5), at least 70% of the project must be hand-coded.
  Below is a complete list of what was NOT hand-written by us, separated
  by source. Nothing here is load-bearing application logic; the AI
  contributions are utility helpers and one merge-conflict resolution.


  --- 7.1  Open-source libraries (npm packages) ---

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
          uuid                 -  invite-token generator
          ical-generator       -  .ics calendar export
          nodemailer           -  installed but UNUSED (we use mailto:)

      Frontend:
          react, react-dom     -  UI framework
          react-router-dom     -  client-side routing
          vite                 -  dev server / bundler
          eslint + plugins     -  linting (dev only)


  --- 7.2  AI-assisted code (Claude / ChatGPT) ---

      app/server/db/migrate.js
          AI-generated short utility script that reads every .sql file
          in db/migrations/ and runs them in order. ~50 lines.

      app/server/lib/mailer.js
          AI-written helper around the mailto: URL pattern. Not an
          actual SMTP mailer.

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

      .ics export integration (last-minute fix)
          Claude assisted with wiring ical-generator output through
          the Express response stream and setting the right
          Content-Disposition header.

      McGill colour palette
          The hex values used throughout the CSS modules were
          suggested by Claude based on McGill's brand guidelines.

      README.md
          Initial outline / formatting of the project README was
          AI-generated; the content (team table, routes, task list)
          is ours.

      AI-generated dummy data
          We used Claude to generate seed rows during development.
          NONE of this dummy data is in the final submission - the
          production database starts empty after the migrations run.


  --- 7.3  Templates / documentation we read but did not copy ---

      - Vite + React project scaffold (`npm create vite@latest`)
        produced the initial app/client/ directory layout, the
        eslint config, and three placeholder files (App.jsx,
        main.jsx, index.css). All of these were heavily rewritten.
      - Express docs and MDN web docs were consulted heavily but
        not copied verbatim.
      - bcrypt and jsonwebtoken README examples informed our auth
        controller structure.


--------------------------------------------------------------------------------
  8. KNOWN LIMITATIONS  (full disclosure for the TA)
--------------------------------------------------------------------------------

   - Logout is client-side only: the JWT is removed from localStorage
     but is not blacklisted server-side, so a stolen token remains
     valid until its expiry. We accepted this as a known trade-off
     given the project scope.
   - No SMTP mailer. Email notifications use the mailto: pattern,
     which opens the user's default mail client. This is exactly
     what the spec asks for ("mailto: not a mail server").
   - Heatmap voting (bonus) and McGill Tinder (bonus) are NOT
     implemented. We implemented the Calendar method for Type-2
     group meetings, which is the required version.
   - The /slots/recurring bulk endpoint exists in the backend but
     the frontend currently calls /slots/create in a loop instead.
     Both paths produce the same data; the bulk endpoint is dead
     code and can be ignored when grading.


--------------------------------------------------------------------------------
  9. CONTACT
--------------------------------------------------------------------------------

  If anything in this README is unclear while grading, please email
  any of us through MyCourses; we will respond ASAP.

  - End of README.txt -
