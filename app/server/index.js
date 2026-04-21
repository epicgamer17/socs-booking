require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const app = express();

//eventually AS BONUS must make this https if possible. most important priority bonus bc otherwise
//jwt tokens can by read any anyone (which breaks the whole point of auth)


//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Routers
const authRouter = require('./routes/auth.js');
const bookingsRouter = require('./routes/bookings.js');
//const dashboardRouter = require('./routes/dashboard.js');
//const groupMeetingsRouter = require('./routes/groupMeetings.js');
const meetingRequestsRouter = require('./routes/meetingRequests.js');
const slotsRouter = require('./routes/slots.js'); 

//Routing 
app.use('/auth', authRouter); 
app.use('/slots', slotsRouter);
app.use('/request', meetingRequestsRouter);

//add others
app.use('/bookings', bookingsRouter);


//rest is to be filled in as we work on it!

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
