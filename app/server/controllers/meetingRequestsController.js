/*
router.post("/meeting", requireAuth, requestMeeting);

router.get("/see", requireAuth, requireOwner, seeMeetingRequests);

router.post("/accept/:id", requireAuth, requireOwner, acceptMeeting);
router.post("/decline/:id", requireAuth, requireOwner, declineMeeting);
*/

const db = require("../db/db");

exports.requestMeeting = async (req, res) => {
    const userID = req.user.id;
    const ownerID = req.body.ownerID;
    const timeFrom = req.body.timeFrom;
    const timeTo = req.body.timeTo;
    const date = req.body.date;
    const message = req.body.message;

    try {
        await db.query(
            `INSERT INTO meetingRequests (userID, ownerID, date, timeFrom, timeTo, message)
            VALUES (?, ?, ?, ?, ?, ?)`, [userID, ownerID, date, timeFrom, timeTo, message]
        );
        return res.status(201).json({ message: "Meeting request sent" });
    } catch (err) {
        return res.status(500).json({ message: "unable to query db", error: err.message });
    }
};



exports.acceptMeeting = async (req, res) => {
    const ownerID = req.user.id;
    const requestID = req.params.id;
    try {
        const [result] = await db.query(
            `UPDATE meetingRequests SET status = ? WHERE id = ? AND ownerID = ?`,
            ["accepted", requestID, ownerID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Issue with request" });
        }
        return res.status(200).json({ message: "Meeting request accepted" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to accept request", error: err.message });
    }
};

exports.declineMeeting = async (req, res) => {
    const ownerID = req.user.id;
    const requestID = req.params.id;
    try {
        const [result] = await db.query(
            `UPDATE meetingRequests SET status = ? WHERE id = ? AND ownerID = ?`,
            ["declined", requestID, ownerID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Issue with request" });
        }
        return res.status(200).json({ message: "Meeting request declined" });
    } catch (err) {
        return res.status(500).json({ message: "Failed to decline request", error: err.message });
    }
};
