const db = require("../db/db");


//create a slot
exports.createSlot = async (req, res) => {

    const ownerID = req.user.id;
    const date = req.body.date;
    const timeFrom = req.body.timeFrom;
    const timeTo = req.body.timeTo;
    try {
        await db.query(
            "INSERT INTO slots (ownerID, date, timeFrom, timeTo) VALUES(?,?,?,?)",
            [ownerID, date, timeFrom, timeTo]
        );
        return res.status(201).json({ message: "Slot created" });
    } catch (err) {
        return res.status(500).json({ message: "Slot creation failed", error: err.message });
    }
};

//view all slots and associated bookings
exports.viewSlots = async (req, res) => {
    const ownerID = req.user.id;
    try {
        const [slots] = await db.query(
            `SELECT 
              slots.id AS slotID,
              slots.date,
              slots.timeFrom,
              slots.timeTo,
              users.email AS bookedByEmail
             FROM slots 
             LEFT JOIN bookings ON slots.id = bookings.slotID 
             LEFT JOIN users ON users.id = bookings.userID
             WHERE slots.ownerID = ?`,
            [ownerID]
          );
          
          res.json(slots);
    } catch (err) {
        return res.status(500).json({ message: "Failed to retrieve slots", error: err.message });
    }
};

//activate a slot 
//delete a slot
