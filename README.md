# SOCS Booking Application

👥 **Team Roles**

| Name | Role | ID | Features Worked On |
| :--- | :--- | :--- | :--- |
| Sophia Hussain | Leader/Backend | 2611418580 | Registration, auth middleware, Slots (create/delete/activate/view my slots/view owners public slots/browse all owners with active slots), users.sql, slots.sql, meetingRequests.sql, Type 1 meeting request |
| Thomas Nguyen | Backend | 261181634 | login/logout controllers, owner middleware, booking controllers (create, view, cancel) |
| Jonathan Lamontagne-Kratz | Frontend | 261143892 | Owner Page, Bonus Features, Global Page Styling, UI Components |
| Tanav Bansal | Frontend/Design | 261075755 | Landing page,registration page,login page |

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
- [ ] 1.3 POST /auth/logout
- [x] 1.4 Landing Page component
- [ ] 1.5 Register/Login validation
- [x] 1.6 Directory Page (Owner listing)
- [ ] 1.7 Invitation Route & Guards

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
- [ ] 2.10 User Dashboard UI
- [ ] 2.11 MailtoButton component
- [ ] 2.12 Request Meeting UI
- [ ] 2.13 Voting Grid selection UI

**Phase 3: Owner Experience & Invitations**
- [x] 3.1 GET /dashboard (Unified)
- [ ] 3.2 POST /slots/:id/invite (Token)
- [ ] 3.3 GET /slots/invite/:token
- [x] 3.4 Owner Dashboard UI (Tabs)
- [ ] 3.5 SlotManager toggle UI
- [x] 3.6 Meeting Request list view
- [ ] 3.7 Calendar Selector form
- [ ] 3.8 Recurring repetition input

**Phase 4: Meeting Types & Bonuses**
- [ ] 4.1 POST /requests
- [x] 4.2 GET /requests/inbox
- [x] 4.3 PATCH /requests/:id/accept
- [x] 4.4 PATCH /requests/:id/decline
- [ ] 4.5 POST /group (Calendar method)
- [ ] 4.6 POST /group/:id/vote
- [ ] 4.7 GET /group/:id/votes
- [ ] 4.8 POST /group/:id/finalize
- [ ] 4.9 POST /officehours (Recurring)
- [ ] 4.10 .ics Calendar Export
- [ ] 4.11 Heatmap Bonus Feature
- [ ] 4.12 McGill Tinder (Team Finder Bonus)

**Phase 5: Final Polish & Submission**
- [ ] 5.1 Finalize Application Name
- [ ] 5.2 Security Review (Protected routes & HTTPS)
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
---
*Note: migrations.js script is AI-generated (short utility script).*
