const db = require("../db/db");
const crypto = require("crypto");


exports.generateLink = async (req, res) => {
    const ownerID = req.user.id;

    try {
        //check if owner has a link
        const[result] = await db.query(`
        SELECT token FROM inviteLinks WHERE ownerID = ?`,[ownerID]);

        // if they already have one, return it
        if (result.length > 0) {
            return res.status(200).json({
                url: `${process.env.FRONTEND_URL}/bookingPage/${result[0].token}`
            });
        }

        const token = crypto.randomBytes(32).toString("hex");

        await db.query(
            `INSERT INTO inviteLinks (ownerID, token) VALUES(?,?)`,
            [ownerID,token]
        );

        return res.status(201).json({
            url: `${process.env.FRONTEND_URL}/bookingPage/${token}`
        });
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate link", error: err.message });
    }

};

//----- Resolve Invite Link -----
exports.resolveLink = async (req, res) => {
    const token = req.params.token;

    try {
        const [result] = await db.query(
            `SELECT ownerID FROM inviteLinks WHERE token = ?`,
            [token]
        );

        if (result.length === 0) {
            return res.status(404).json({ message: "Invalid or expired link" });
        }

        return res.status(200).json({ ownerID: result[0].ownerID });

    } catch (err) {
        return res.status(500).json({ message: "Failed to resolve link", error: err.message });
    }
};

//----- Delete Invite Link -----
exports.deleteLink = async (req, res) => {
    const ownerID = req.user.id;

    try {
        const [result] = await db.query(
            `DELETE FROM inviteLinks WHERE ownerID = ?`,
            [ownerID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No link found" });
        }

        return res.status(200).json({ message: "Invite link deleted" });

    } catch (err) {
        return res.status(500).json({ message: "Failed to delete link", error: err.message });
    }
};

