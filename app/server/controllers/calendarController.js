//Sophia Hussain
const db = require("../db/db");
const { ICalCalendar } = require("ical-generator");  // AI FIX to use ICalCalendar class instead of ical
const { addBookingEvent } = require("../lib/icsHelpers"); // Author: Claude — extracted helper

//----- Export Bookings as .ics file -----
exports.exportCalendar = async (req, res) => {
    const userID = req.user.id;
    const role = req.user.role;

    try {
        let bookings;

        if (role === "owner") {
            // get bookings for owner's slots
            const [rows] = await db.query(
                `SELECT
                slots.date,
                slots.timeFrom,
                slots.timeTo,
                students.email AS otherEmail,
                students.firstName,
                students.lastName
                 FROM slots
                 JOIN bookings ON bookings.slotID = slots.id
                 JOIN users AS students ON students.id = bookings.userID
                 WHERE slots.ownerID = ?`,
                [userID]
            );

            bookings = rows;
        } else {
            // get bookings made by student
            const [rows] = await db.query(
                `SELECT
                slots.date,
                slots.timeFrom,
                slots.timeTo,
                owners.email AS otherEmail,
                owners.firstName,
                owners.lastName
                 FROM bookings
                 JOIN slots ON slots.id = bookings.slotID
                 JOIN users AS owners ON owners.id = slots.ownerID
                 WHERE bookings.userID = ?`,
                [userID]
            );

            bookings = rows;
        }

        const calendar = new ICalCalendar({ name: "My Meetings" });  // AI FIX

        for (const booking of bookings) {
            addBookingEvent(calendar, booking);
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

//----- Export a Single Booking as .ics file -----
// Author: Claude (Anthropic), per Thomas Nguyen request
exports.exportSingleEvent = async (req, res) => {
    const userID = req.user.id;
    const role = req.user.role;
    const slotID = req.params.slotID;

    try {
        let rows;

        if (role === "owner") {
            // owner can only export a slot they own that has a booking
            [rows] = await db.query(
                `SELECT
                slots.date,
                slots.timeFrom,
                slots.timeTo,
                students.email AS otherEmail,
                students.firstName,
                students.lastName
                 FROM slots
                 JOIN bookings ON bookings.slotID = slots.id
                 JOIN users AS students ON students.id = bookings.userID
                 WHERE slots.id = ? AND slots.ownerID = ?`,
                [slotID, userID]
            );
        } else {
            // student can only export a slot they personally booked
            [rows] = await db.query(
                `SELECT
                slots.date,
                slots.timeFrom,
                slots.timeTo,
                owners.email AS otherEmail,
                owners.firstName,
                owners.lastName
                 FROM bookings
                 JOIN slots ON slots.id = bookings.slotID
                 JOIN users AS owners ON owners.id = slots.ownerID
                 WHERE slots.id = ? AND bookings.userID = ?`,
                [slotID, userID]
            );
        }

        // 404 (not 403) so we don't leak whether the slot exists for someone else
        if (rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        const calendar = new ICalCalendar({ name: "My Meeting" });
        addBookingEvent(calendar, rows[0]);

        res.setHeader("Content-Type", "text/calendar; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=meeting-${slotID}.ics`);

        return res.send(calendar.toString());

    } catch (err) {
        console.error("[calendarController.exportSingleEvent]", err);

        return res.status(500).json({
            message: "Failed to export event"
        });
    }
};
