//Sophia Hussain, Thomas Nguyen

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;
const app = express();

// rate limiting
const { rateLimit } = require('express-rate-limit');
// BEGIN: code pasted from https://www.npmjs.com/package/express-rate-limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
  // store: ... , // Redis, Memcached, etc. See below.
});

// Apply the rate limiting middleware to all requests.
app.use(limiter);
// END: code pasted from https://www.npmjs.com/package/express-rate-limit


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));


//Routers
const authRouter = require('./routes/auth.js');
const bookingsRouter = require('./routes/bookings.js');
const dashboardRouter = require('./routes/dashboard.js');
const groupMeetingsRouter = require('./routes/groupMeetings.js');
const meetingRequestsRouter = require('./routes/meetingRequests.js');
const slotsRouter = require('./routes/slots.js'); 
const inviteLinkRouter = require('./routes/inviteLink.js');
const calendarRouter = require('./routes/calendar.js');


//Routing 
app.use('/auth', authRouter); 
app.use('/slots', slotsRouter);
app.use('/request', meetingRequestsRouter);
app.use('/bookings', bookingsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/url', inviteLinkRouter);
app.use('/groupMeetings', groupMeetingsRouter);
app.use('/calendar', calendarRouter);

// wiring for HTTPS
// BEGIN: AI-generated code
const path = require('path');

// Serve built React app
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// SPA fallback — any non-API GET goes to index.html so React Router can handle it
app.get(/^\/(?!auth|slots|request|bookings|dashboard|url|groupMeetings).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});
// END: AI-generated code


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
