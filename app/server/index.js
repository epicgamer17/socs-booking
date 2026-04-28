//Sophia Hussain, Thomas Nguyen

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const PORT = process.env.PORT || 3000;
const app = express();

//eventually AS BONUS must make this https if possible. most important priority bonus bc otherwise
//jwt tokens can by read any anyone (which breaks the whole point of auth)


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

//Routing 
app.use('/auth', authRouter); 
app.use('/slots', slotsRouter);
app.use('/request', meetingRequestsRouter);
app.use('/bookings', bookingsRouter);
app.use('/dashboard', dashboardRouter);
app.use('/url', inviteLinkRouter);
app.use('/groupMeetings', groupMeetingsRouter);

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
