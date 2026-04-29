// Author: Claude (Anthropic), per Thomas Nguyen request
// Shared helper for building an ICS event from a booking row.
// Used by calendarController.exportCalendar (bulk) and
// calendarController.exportSingleEvent (per-slot).

function addBookingEvent(calendar, booking) {
    // mysql2 may return DATE columns as JS Date or as a YYYY-MM-DD string
    const dateStr = booking.date instanceof Date
        ? booking.date.toISOString().split("T")[0]
        : booking.date;

    const start = new Date(`${dateStr}T${booking.timeFrom}`);
    const end = new Date(`${dateStr}T${booking.timeTo}`);

    calendar.createEvent({
        start,
        end,
        summary: `Meeting with ${booking.firstName} ${booking.lastName}`,
        description: `Booked through McGill.\nContact: ${booking.otherEmail}`,
    });
}

module.exports = { addBookingEvent };
