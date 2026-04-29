//Sophia Hussain and AI???? (accept and decline meeting function)
const db = require("../db/db");
const { sendNotification } = require("../lib/mailer");

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
        console.error("[meetingRequestsController.seeMeetingRequests]", err);
        return res.status(500).json({ message: "Failed to retrieve meeting requests" });
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

        sendNotification({
            to: ownerEmail,
            subject: "New meeting request",
            text: `You have a new meeting request for ${date} from ${timeFrom} to ${timeTo}`,
            replyTo: req.user.email,
        }).catch(err => {
            console.error("[sendNotification.requestMeeting]", err);
        });

        return res.status(201).json({
            message: "Meeting request sent",
        });

    } catch (err) {
        console.error("[meetingRequestsController.requestMeeting]", err);
        return res.status(500).json({ message: "unable to query db" });
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

        sendNotification({
            to: bookedByEmail,
            subject: "Meeting request accepted",
            text: `Your meeting request on ${date} from ${timeFrom} to ${timeTo} has been accepted`,
            replyTo: req.user.email,
        }).catch(err => {
            console.error("[sendNotification.acceptMeeting]", err);
        });

        return res.status(200).json({
            message: "Meeting request accepted"
        });
        
    } catch (err) {
        await conn.rollback();
        console.error("[meetingRequestsController.acceptMeeting]", err);
        return res.status(500).json({ message: "Failed to accept request" });
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
            `UPDATE meetingRequests
             SET status = 'declined'
             WHERE id = ? AND ownerID = ? AND status = 'pending'`,
            [requestID, ownerID]
        );

        sendNotification({
            to: rows[0].bookedByEmail,
            subject: "Meeting request declined",
            text: `Your meeting request for ${rows[0].date} from ${rows[0].timeFrom} to ${rows[0].timeTo} has been declined.`,
            replyTo: req.user.email,
        }).catch(err => {
            console.error("[sendNotification.declineMeeting]", err);
        });
        
        return res.status(200).json({
            message: "Meeting request declined"
        });
    } catch (err) {
        console.error("[meetingRequestsController.declineMeeting]", err);
        return res.status(500).json({ message: "Failed to decline request" });
    }
};
