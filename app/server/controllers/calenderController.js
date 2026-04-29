//Sophia Hussain
const db = require("../db/db");
const ical = require("ical-generator");

//----- Export Bookings as .ics file -----
exports.exportCalendar = async (req, res) => {
    const userID = req.user.id;

    // get confirmed bookings 
    try {
        const [bookings] = await db.query(
            `SELECT 
                slots.date, 
                slots.timeFrom, 
                slots.timeTo, 
                owners.email AS ownerEmail,
                owners.firstName,
                owners.lastName
             FROM bookings
             JOIN slots ON slots.id = bookings.slotID
             JOIN users AS owners ON owners.id = slots.ownerID
             WHERE bookings.userID = ?`,
            [userID]
        );

        const calendar = ical({ name: "My Meetings" });

        // create a calendar event for each booking
        for (const booking of bookings) {
            const start = new Date(`${booking.date}T${booking.timeFrom}`);
            const end = new Date(`${booking.date}T${booking.timeTo}`);

            calendar.createEvent({
                start,
                end,
                summary: `Meeting with ${booking.firstName} ${booking.lastName}`,
                description: `Booked through McGill.\nContact: ${booking.ownerEmail}`,
                organizer: {
                    name: `${booking.firstName} ${booking.lastName}`,
                    email: booking.ownerEmail,
                },
            });
        }

        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader("Content-Disposition", "attachment; filename=meetings.ics");

        return res.send(calendar.toString());

    } catch (err) {
        console.error("[calendarController.exportCalendar]", err);

        return res.status(500).json({
            message: "Failed to export calendar"
        });
    }
};