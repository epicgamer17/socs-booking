require('dotenv').config();
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 5000;
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//Routers
const authRouter = require('./routes/auth.js');
const bookingsRouter = require('./routes/bookings.js');
const dashboardRouther = require('./routes/dashboard.js');
const groupMeetingsRouther = require('./routes/groupMeetings.js');
const meetingRequestRouther = require('./routes/meetingRequest.js');
const slotsRouter = require('./routes/slots.js'); 

//Routing 
app.use('/registration', authRouter);
app.use('/login', authRouter);
app.use('/logout', authRouter); //not sure if needed. Delete later possibly.

//rest is to be filled in as we work on it!

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
