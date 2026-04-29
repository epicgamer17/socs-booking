//Sophia Hussain
const db = require("../db/db");
const crypto = require("crypto");

//----- Get all Owners with Public Slots -----
exports.getOwners = async (req, res) => {
  try {
    // AI Query - by jonathan
    const [rows] = await db.query(
      `SELECT users.id AS ownerID, users.firstName, users.lastName,
              users.department, users.email, inviteLinks.token AS inviteToken
         FROM users
         JOIN slots ON slots.ownerID = users.id AND slots.isActive = TRUE
    LEFT JOIN inviteLinks ON inviteLinks.ownerID = users.id
        WHERE users.role = 'owner'
     GROUP BY users.id`
    );

    // AI for the for loop here by Jonathan.
    // Backfill an invite token for any owner that doesn't have one — keeps ownerIDs
    // out of directory URLs without requiring every owner to visit their dashboard first.
    const owners = [];
    for (const row of rows) {
      let token = row.inviteToken;
      if (!token) {
        token = crypto.randomBytes(32).toString("hex");
        await db.query(
          `INSERT INTO inviteLinks (ownerID, token) VALUES(?, ?)`,
          [row.ownerID, token]
        );
      }
      owners.push({
        firstName: row.firstName,
        lastName: row.lastName,
        department: row.department,
        email: row.email,
        inviteToken: token,
      });
    }

    return res.status(200).json(owners);
  } catch (err) {
    console.error("[slotsController.getOwners]", err);
    return res.status(500).json({ message: "Failed to retrieve owners" });
  }
};


//----- Get all Public Available Slot of Specific Owner -----
exports.viewOwnersSlots = async (req, res) => {
  const ownerID = req.params.ownerID
  try {
    const [result] = await db.query(`
    SELECT * FROM slots WHERE slots.ownerID = ? 
    AND slots.isActive = TRUE
    AND slots.id NOT IN (SELECT slotID FROM bookings)`,
      [ownerID]);

    return res.status(200).json(result);
  } catch (err) {
    console.error("[slotsController.viewOwnersSlots]", err);
    return res.status(500).json({ message: "Error finding public slots" })

  }
}


//----- Create Slot -----
exports.createSlot = async (req, res) => {

  const ownerID = req.user.id;
  //get slot details from req body
  const date = req.body.date;
  const timeFrom = req.body.timeFrom;
  const timeTo = req.body.timeTo;

  //missing fields
  if (!date || !timeFrom || !timeTo) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  //invalid time range
  if (timeFrom >= timeTo) {
    return res.status(400).json({ message: "timeFrom must be before timeTo" });
  }

  try {
    //insert slot into db
    await db.query(
      "INSERT INTO slots (ownerID, date, timeFrom, timeTo) VALUES(?,?,?,?)",
      [ownerID, date, timeFrom, timeTo]
    );
    return res.status(201).json({ message: "Slot created" });
  } catch (err) {
    console.error("[slotsController.createSlot]", err);
    return res.status(500).json({ message: "Slot creation failed" });
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
    console.error("[slotsController.viewSlots]", err);
    return res.status(500).json({ message: "Failed to retrieve slots" });
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
    console.error("[slotsController.activateSlot]", err);
    return res.status(500).json({
      message: "Failed to activate slot"
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
    if (rows[0].bookedByEmail !== null) {
      return res.status(200).json({
        message: `Booking on ${rows[0].date} from ${rows[0].timeFrom} to ${rows[0].timeTo} has been cancelled`,
        emailToNotify: rows[0].bookedByEmail
      });
    }
    return res.status(200).json({ message: "Slot deleted" });

  } catch (err) {
    console.error("[slotsController.deleteSlot]", err);
    return res.status(500).json({ message: "Failed to delete slot" });
  }
};


//-----(Type 3) Create Recurring Office Hours -----
exports.createRecurringSlots = async (req, res) => {
  const ownerID = req.user.id;
  const days = req.body.days; // array of dates 
  const weeks = req.body.weeks; // number of weeks to repeat
  const timeFrom = req.body.timeFrom;
  const timeTo = req.body.timeTo;

  //check if required fields are provided
  if (!days || days.length === 0 || !weeks || !timeFrom || !timeTo) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const values = [];

    //calculate all slot dates by adding 7 days per week offset
    for (let week = 0; week < weeks; week++) {
      for (const day of days) {
        const slotDate = new Date(day);
        slotDate.setDate(slotDate.getDate() + (week * 7));
        values.push([ownerID, slotDate.toISOString().split("T")[0], timeFrom, timeTo]);
      }
    }

    //bulk insert all slots in one query
    await conn.query(
      `INSERT INTO slots (ownerID, date, timeFrom, timeTo) VALUES ?`,
      [values]
    );

    await conn.commit();
    return res.status(201).json({ message: "Recurring slots created" });
  } catch (err) {
    await conn.rollback();
    console.error("[slotsController.createRecurringSlots]", err);
    return res.status(500).json({ message: "Failed to create recurring slots" });
  } finally {
    //release connection back to pool
    conn.release();
  }
};
