const db = require("../db/db");

//----- Get all Owners with Public Slots -----
exports.getOwners = async (req, res) => {
  try {
    const [result] = await db.query(
      `SELECT DISTINCT users.id AS ownerID, users.firstName,
      users.lastName, users.department, users.email FROM users
       LEFT JOIN slots ON slots.ownerID = users.id
       WHERE slots.isActive = TRUE AND users.role = 'owner'`
    );
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to retrieve owners", error: err.message });
  }
};


//----- Get all Public Available Slot of Specific Owner -----
exports.viewOwnersSlots = async (req, res) => {
  const ownerID = req.params.ownerID
  try{
    const[result] = await db.query(`
    SELECT * FROM slots WHERE slots.ownerID = ? 
    AND slots.isActive = TRUE
    AND slots.id NOT IN (SELECT slotID FROM bookings)`,
    [ownerID]);

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({message: "Error finding public slots", error: err.message})

  }
}


//----- Create Slot -----
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

//----- View all Slots and Associated Bookings -----
exports.viewSlots = async (req, res) => {
    const ownerID = req.user.id;

    try {
        const [slots] = await db.query(
            `SELECT 
              slots.id AS slotID,
              slots.date,
              slots.timeFrom,
              slots.timeTo,
              slots.isActive,
              users.email AS bookedByEmail
             FROM slots 
             LEFT JOIN bookings ON slots.id = bookings.slotID 
             LEFT JOIN users ON users.id = bookings.userID
             WHERE slots.ownerID = ?`,
            [ownerID]
        );

        return res.status(200).json(slots);
    } catch (err) {
        return res.status(500).json({ message: "Failed to retrieve slots", error: err.message });
    }
};

//----- Activate a Slot ----- 
exports.activateSlot = async (req, res) => {
    const slotID = req.params.id;
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

        return res.status(200).json({ message: "Slot activated" });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to activate slot", error: err.message
        });
    }
};

//----- Delete a Slot -----
exports.deleteSlot = async (req, res) => {
    const slotID = req.params.id;
    const ownerID = req.user.id;
    try {
      //get slot and booker info
      const [rows] = await db.query(
        `SELECT slots.date, slots.timeFrom, slots.timeTo, users.email AS bookedByEmail
         FROM slots
         LEFT JOIN bookings ON slots.id = bookings.slotID
         LEFT JOIN users ON users.id = bookings.userID
         WHERE slots.id = ? AND slots.ownerID = ?`,
        [slotID, ownerID]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Unauthorized or slot does not exist" });
      }
      //delete booking associated to slot if it exists
      if (rows[0].bookedByEmail !== null) {
        await db.query("DELETE FROM bookings WHERE slotID = ?", [slotID]);
      }
      //delete slot
      await db.query(
        "DELETE FROM slots WHERE id = ? AND ownerID = ?",
        [slotID, ownerID]
      );
      return res.status(200).json({
        message: `Booking on ${rows[0].date} from ${rows[0].timeFrom} to ${rows[0].timeTo} has been cancelled`,
        emailToNotify: rows[0].bookedByEmail
      });
    } catch (err) {
      return res.status(500).json({ message: "Failed to delete slot", error: err.message });
    }
  };


  //create recurring office hours slots
  exports.createRecurringSlots = async (req, res) => {
    const ownerID = req.user.id;
    const days = req.body.days; // array of dates e.g. ["2026-04-27", "2026-04-29"]
    const weeks = req.body.weeks;
    const timeFrom = req.body.timeFrom;
    const timeTo = req.body.timeTo;

    if (!days || days.length === 0 || !weeks) {
      return res.status(400).json({ message: "Missing required fields" });
  }
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const values = [];

        for (let week = 0; week < weeks; week++) {
            for (const day of days) {
                const slotDate = new Date(day);
                slotDate.setDate(slotDate.getDate() + (week * 7));
                values.push([ownerID, slotDate.toISOString().split("T")[0], timeFrom, timeTo]);
            }
        }

        await conn.query(
            `INSERT INTO slots (ownerID, date, timeFrom, timeTo) VALUES ?`,
            [values]
        );

        await conn.commit();
        return res.status(201).json({ message: "Recurring slots created" });
    } catch (err) {
        await conn.rollback();
        return res.status(500).json({ message: "Failed to create recurring slots", error: err.message });
    } finally {
        conn.release();
    }
};