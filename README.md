# myBookings Application

URL (requires either McGill VPN or being on the campus network to access) : https://winter2026-comp307-group12.cs.mcgill.ca/

👥 **Team Roles**

| Name | Role | ID | Features Worked On |
| :--- | :--- | :--- | :--- |
| Sophia Hussain | Leader/Backend | 2611418580 | Registration, auth middleware, Slots (create/delete/activate/view my slots/view owners public slots/browse all owners with active slots), users.sql, slots.sql, meetingRequests.sql, inviteLinks.sql Type 1 meeting request, Type 3 recurring office hours |
| Thomas Nguyen | Backend | 261181634 | login/logout controllers, booking controllers, dashboard controllers, Type 2 group meetings, groupMeetings.sql, bookings.sql, various security features |
| Jonathan Lamontagne-Kratz | Frontend/Design | 261143892 | Owner Page, UI Components, Global Styling, Page Styling, Component Styling, Fetching with Auth on Frontend |
| Tanav Bansal | Frontend/Design | 261075755 | DirectoryPage, Booking Page, Landing page, Registration page, Login page, Bonus Features |

🛠 **Tech Stack**

- **Database:** MariaDB
- **Backend:** Node.js, Express
- **Frontend:** React

🚀 **Quick Start & Local Testing**

Use these commands to run the project locally and test the code running on the SOCS servers. You SSH with port-forwarding on the first terminal, without on the second, if you want to test both backend and frontend at the same time.

1. **SSH into the SOCS Server (Enable local testing)**
   ```bash
   ssh -L 3000:localhost:3000 -L 5173:localhost:5173 winter2026-comp307
   ```

2. **Start the Backend Server**
   ```bash
   cd socs-booking/app/server
   node index.js
   # Test at: http://localhost:3000/
   ```

3. **Access the MariaDB Database**
   (Credentials are located in `socs-booking/app/server/.env`)
   ```bash
   mysql -u cs307-user -p
   ```

4. **Start the Frontend Client**
   ```bash
   cd socs-booking/app/client
   npm run dev
   # Test at: http://localhost:5173/
   ```

For enabling access to the site through the URL, do this on Mimi:
```bash
cd socs-booking/app/server
npm start
```

📡 **Backend Routes & API Guide**

### Authentication Overview
Authentication uses JWT. After logging in, you must send the token with all protected requests. Put the payload information in the body of the request.

**Required Header for Protected Routes:**
`Authorization: Bearer <your_jwt_token_here>`

| Method | Endpoint | Required Payload | Description |
| :--- | :--- | :--- | :--- |
| POST | `/auth/register` | email, password | Registers a new user. |
| POST | `/auth/login` | email, password | Returns a JWT token. |
| POST | `/auth/logout` | None | Destroys session. |

### Slots API — Frontend Reference
All slot routes require JWT token in header.
*Dates: YYYY-MM-DD, Times: HH:MM.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/slots/owners` | Returns all owners with active slots. |
| POST | `/slots/create` | (Owner Only) Create a new slot. Body: `{ date, timeFrom, timeTo }` |
| GET | `/slots/viewMy` | (Owner Only) Returns owner's slots and booking status. |
| PUT | `/slots/activate/:id` | (Owner Only) Activates a private slot. |
| GET | `/slots/public/:ownerID` | Returns all active, unbooked slots for that owner. |
| DELETE | `/slots/delete/:id` | (Owner Only) Deletes slot and returns cancellation info. |

✉️ **Quick Reference: The mailto: Pattern**
Use this pattern for email notifications. The backend returns the string for the frontend to execute:
```javascript
const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
window.open(mailtoUrl);
```

📋 **Task List Progress**

**Phase 0: Initial Setup**
- [x] 0.1 Set up Express app
- [x] 0.2 Database Connection
- [x] 0.3 Database Tables
- [x] 0.4 requireAuth Middleware
- [x] 0.5 requireOwner Middleware

**Phase 1: Core & Auth**
- [x] 1.1 POST /auth/register
- [x] 1.2 POST /auth/login
- [x] 1.3 POST /auth/logout
- [x] 1.4 Landing Page component
- [x] 1.5 Register/Login validation
- [x] 1.6 Directory Page (Owner listing)
- [x] 1.7 Invitation Route & Guards

**Phase 2: User Experience & Basic Slots**
- [x] 2.1 GET /users/owners
- [x] 2.2 POST /slots (Create)
- [x] 2.3 GET /slots/mine (View My)
- [x] 2.4 PATCH /slots/:id/activate
- [x] 2.5 DELETE /slots/:id
- [x] 2.6 GET /slots/owner/:ownerId
- [x] 2.7 POST /bookings
- [x] 2.8 GET /bookings/mine
- [x] 2.9 DELETE /bookings/:id
- [x] 2.10 User Dashboard UI
- [x] 2.11 MailtoButton component
- [x] 2.12 Request Meeting UI
- [ ] 2.13 Voting Grid selection UI

**Phase 3: Owner Experience & Invitations**
- [x] 3.1 GET /dashboard (Unified)
- [x] 3.2 POST /slots/:id/invite (Token) — implemented as `POST /url/generate`
- [x] 3.3 GET /slots/invite/:token — implemented as `GET /url/resolve/:token`
- [x] 3.4 Owner Dashboard UI (Tabs)
- [x] 3.5 SlotManager toggle UI
- [x] 3.6 Meeting Request list view
- [x] 3.7 Calendar Selector form
- [x] 3.8 Recurring repetition input

**Phase 4: Meeting Types & Bonuses**
- [x] 4.1 POST /requests — implemented as `POST /request/meeting`
- [x] 4.2 GET /requests/inbox
- [x] 4.3 PATCH /requests/:id/accept
- [x] 4.4 PATCH /requests/:id/decline
- [x] 4.5 POST /group (Calendar method)
- [x] 4.6 POST /group/:id/vote — backend only; student-side UI not yet wired (see 2.13)
- [x] 4.7 GET /group/:id/votes
- [x] 4.8 POST /group/:id/finalize — implemented as `POST /groupMeetings/group/finalize/:id`
- [x] 4.9 POST /officehours (Recurring) — implemented as `POST /slots/recurring` (frontend still uses `/slots/create` in a loop; bulk endpoint is unused)
- [ ] 4.10 .ics Calendar Export
- [ ] 4.11 Heatmap Bonus Feature
- [ ] 4.12 McGill Tinder (Team Finder Bonus)

**Phase 5: Final Polish & Submission**
- [ ] 5.1 Finalize Application Name
- [x] 5.2 Security Review (Protected routes & HTTPS)
- [ ] 5.3 Code Attribution & README update (30% Rule)
- [ ] 5.4 5-Minute Walkthrough Video (with audio)

---
### 📝 Code Attribution & 30% Rule
*In accordance with COMP 307 requirements, below is the list of code/libraries not written by the team (max 30%):*

| Resource | Usage/Location | Origin |
| :--- | :--- | :--- |
| `migrations.js` | Database initialization | AI-generated utility script |
| React | Frontend framework | Bootstrap/Meta |
| Node/Express | Backend server | Open source |
| mysql2/jwt/bcrypt | Auth & DB utilities | NPM packages |
| README.md | Basic outline | AI-generated outline and formatting |
| AI Generated Dummy Data | (not used in final submission) |
| Merge conflict resolution | `db/migrations/05_groupMeetings.sql` after master was merged into feature branch | AI assistance |
| params.toString().replace(/\+/g, "%20")|formatedParams in MailtoButton.jsx|claude
|DEPARTMENT_OPTIONS|departments.jsx convert the html from minerva to json format|claude
| `mailer.js` | Mailer helper function | Claude |
| `useAutoRefresh.jsx` | Auto refresh hook | Claude |
| AI used for "McGill Color Palette" Colors | 

---
*Note: migrations.js script is AI-generated (short utility script).*
