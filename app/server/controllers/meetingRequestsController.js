//Sophia Hussain and AI????(accept meeting function)
const db = require("../db/db");


//----- See all Meeting Requests -----
exports.seeMeetingRequests = async (req, res) => {
    const ownerID = req.user.id;

    try {
        const [result] = await db.query(
            `SELECT
                meetingRequests.id,
                meetingRequests.userID,
                meetingRequests.date,
                meetingRequests.timeFrom,
                meetingRequests.timeTo,
                meetingRequests.message,
                users.email AS requestedBy
            FROM meetingRequests
            LEFT JOIN users ON users.id = meetingRequests.userID
            WHERE meetingRequests.status = 'pending' AND meetingRequests.ownerID = ?`,
            [ownerID]
        );
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({ message: "Failed to retrieve meeting requests", error: err.message });
    }
};


//----- Request a Meeting -----
exports.requestMeeting = async (req, res) => {
    const userID = req.user.id;
    const ownerEmail = req.body.ownerEmail;
    const timeFrom = req.body.timeFrom;
    const timeTo = req.body.timeTo;
    const date = req.body.date;
    const message = req.body.message;

    try {

        // look up ownerID from email
        const [rows] = await db.query(
            `SELECT id FROM users WHERE email = ? AND role = 'owner'`,
            [ownerEmail]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Owner not found" });
        }

        const ownerID = rows[0].id;

        await db.query(
            `INSERT INTO meetingRequests (userID, ownerID, date, timeFrom, timeTo, message)
            VALUES (?, ?, ?, ?, ?, ?)`, [userID, ownerID, date, timeFrom, timeTo, message]
        );
        return res.status(201).json({
            message: "Meeting request sent",
            emailToNotify: ownerEmail,
            date,
            timeFrom,
            timeTo
        });
    } catch (err) {
        return res.status(500).json({ message: "unable to query db", error: err.message });
    }
};


//----- Accept a Meeting Request -----
exports.acceptMeeting = async (req, res) => {
    const ownerID = req.user.id;
    const requestID = req.params.id;

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        // Lock the pending request and pull requester email in one go
        const [rows] = await conn.query(
            `SELECT meetingRequests.userID,
                    meetingRequests.date,
                    meetingRequests.timeFrom,
                    meetingRequests.timeTo,
                    users.email AS bookedByEmail
               FROM meetingRequests
               JOIN users ON users.id = meetingRequests.userID
              WHERE meetingRequests.id = ?
                AND meetingRequests.ownerID = ?
                AND meetingRequests.status = 'pending'
              FOR UPDATE`,
            [requestID, ownerID]
        );

        if (rows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ message: "Request not found or already handled" });
        }

        const { userID, date, timeFrom, timeTo, bookedByEmail } = rows[0];

        await conn.query(
            `UPDATE meetingRequests SET status = 'accepted' WHERE id = ?`,
            [requestID]
        );

        // Accepted requests produce an already-claimed active slot
        const [slotResult] = await conn.query(
            `INSERT INTO slots (ownerID, date, timeFrom, timeTo, isActive)
             VALUES (?, ?, ?, ?, TRUE)`,
            [ownerID, date, timeFrom, timeTo]
        );

        await conn.query(
            `INSERT INTO bookings (slotID, userID) VALUES (?, ?)`,
            [slotResult.insertId, userID]
        );

        await conn.commit();

        return res.status(200).json({
            message: "Meeting request accepted",
            emailToNotify: bookedByEmail,
            date,
            timeFrom,
            timeTo,
        });
    } catch (err) {
        await conn.rollback();
        return res.status(500).json({ message: "Failed to accept request", error: err.message });
    } finally {
        conn.release();
    }
};

//----- Decline a Meeting Request -----
exports.declineMeeting = async (req, res) => {
    const ownerID = req.user.id;
    const requestID = req.params.id;
    try {
        const [rows] = await db.query(
            `SELECT meetingRequests.date,
                    meetingRequests.timeFrom,
                    meetingRequests.timeTo,
                    users.email AS bookedByEmail
               FROM meetingRequests
               JOIN users ON users.id = meetingRequests.userID
              WHERE meetingRequests.id = ?
                AND meetingRequests.ownerID = ?
                AND meetingRequests.status = 'pending'`,
            [requestID, ownerID]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Request not found or already handled" });
        }

        await db.query(
            `UPDATE meetingRequests SET status = 'declined' WHERE id = ?`,
            [requestID]
        );

        return res.status(200).json({
            message: "Meeting request declined",
            emailToNotify: rows[0].bookedByEmail,
            date: rows[0].date,
            timeFrom: rows[0].timeFrom,
            timeTo: rows[0].timeTo,
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to decline request", error: err.message });
    }
};
