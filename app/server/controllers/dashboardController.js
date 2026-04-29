//Thomas Nguyen

const db = require("../db/db");
const { getSlotsForOwner, getPendingRequestsForOwner, getPollsForOwner, getBookingsForUser, getPollsForInvitedUser } = require("../lib/queryHelpers");

// return their slots + who booked each + pending meeting requests + their live group meeting polls
// heavily reusing code from slotsController.js, meetingRequestsController.js, and groupMeetingsController.js
exports.dashboardDataForOwner = async (req, res) => {
  const ownerID = req.user.id;

  try {
    // get the slots and associated bookings
    const slotsBookingsRows = await getSlotsForOwner(ownerID);

    // get pending meeting requests
    const meetingRequestRows = await getPendingRequestsForOwner(ownerID);

    // fetch group meeting non-finalized poll data
    const groupMeetingData = await getPollsForOwner(ownerID);

    return res.status(200).json({ slots: slotsBookingsRows, meetingRequests: meetingRequestRows, polls: groupMeetingData });
  } catch (err) {
    console.error("[dashboardController.dashboardDataForOwner]", err);
    return res.status(500).json({ message: "Failed to retrieve owner dashboard data." });
  }
}

// return all bookings they made + all the group meeting polls they're invited to
// heavily reusing code from slotsController.js and groupMeetingsController.js
exports.dashboardDataForStudent = async (req, res) => {
  // near exact duplicate of bookingsController.viewBookings (as of PR #43)
  const userID = req.user.id;

  try {
    // fetch the bookings
    const bookingRows = await getBookingsForUser(userID);

    // fetch the group meeting poll data
    const groupMeetingData = await getPollsForInvitedUser(userID);

    // return the info about the bookings to the booker
    return res.status(200).json({ bookingRows: bookingRows, groupMeetingRows: groupMeetingData });
  } catch (err) {
    console.error("[dashboardController.dashboardDataForStudent]", err);
    return res.status(500).json({ message: "Failed to retrieve student dashboard data" });
  }
}
