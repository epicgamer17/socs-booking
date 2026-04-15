const db = require("../db/db");


//create a slot
exports.createSlot = async (req, res) => {

    const ownerID = req.user.id;
    //get slot details from req body
    const date = req.body.date;
    const timeFrom = req.body.timeFrom;
    const timeTo = req.body.timeTo;
    try {
        //insert slot into db
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
exports.activateSlot = async (req, res) => {
    const slotID = req.body.id;
    const ownerID = req.user.id;

    try {

        const [result] = await db.query(
            "UPDATE slots SET isActive = TRUE WHERE id = ? AND ownerID = ?",
            [slotID, ownerID]
        );

        //if no affected rows, activate operation was not performed
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Unauthorized or slot does not exist" });
        }

        return res.json({ message: "Slot activated" });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to activate slot", error: err.message
        });
    }
};

//delete a slot
exports.deleteSlot = async (req, res) => {
const slotID = req.body.id;
const ownerID = req.user.id;


};
