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

//view all slots 


//delete a slot
