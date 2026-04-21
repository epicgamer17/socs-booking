/*
For the bookings table, can you make sure it has:

id (primary key)
slotID (foreign key → slots.id)
userID (who booked the slot)
optional: dateBooked

I’m using:
bookings.slotID to join with slots.id
bookings.userID to join with users.id (to get the email)
So slotID and userID need to match exactly.
Also, I think each slot should only have one booking, so we might want UNIQUE(slotID)


*/


exports.bookSlot = async (req, res) => {
    const userID = req.user.id;
    const slotID = req.params.id;
    const dateBooked = req.body.date;

    try {
        //insert slot into db
        await db.query(
            "INSERT INTO bookings (bookingID, slotID, userID, dateBooked) VALUES(?,?,?,?)",
            [bookingID, slotID, userID, dateBooked]
        );
        return res.status(201).json({ message: "Slot booked" });
    } catch (err) {
        return res.status(500).json({ message: "Slot booking failed", error: err.message });
    }
}
