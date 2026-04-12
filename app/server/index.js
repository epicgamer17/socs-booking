require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Routers
const authRouter = require('./routes/auth.js');
//const bookingsRouter = require('./routes/bookings.js');
//const dashboardRouter = require('./routes/dashboard.js');
//const groupMeetingsRouter = require('./routes/groupMeetings.js');
//const meetingRequestRouter = require('./routes/meetingRequest.js');
//const slotsRouter = require('./routes/slots.js'); 

//Routing 
app.use('/auth', authRouter); 

//add others

//delete comment later (just here for explination)
// basically front end should send api calls for things like login,logout/register
// with /auth/register, /auth/login /auth/logout like that. important for router and
//controller to work!

//rest is to be filled in as we work on it!

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
