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

    try {
        // verify slot exists
        const [rows] = await db.query(
            `SELECT slots.id
             FROM slots
             WHERE slots.id = ? AND isActive = TRUE`,
            [slotID]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Slot does not exist or is not active" });
        }

        // book the slot
        // created at date already set automatically by the DB
        await db.query(
            "INSERT INTO bookings (slotID, userID) VALUES(?,?,?)",
            [slotID, userID, dateBooked]
        );
        return res.status(201).json({ message: "Slot booked" });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            // needs UNIQUE(slotID) for this branch to ever trigger
            return res.status(409).json({ message: "Slot already booked" });
        }
        return res.status(500).json({ message: "Slot booking failed", error: err.message });
    }
}
