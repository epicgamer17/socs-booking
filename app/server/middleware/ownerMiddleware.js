//Thomas Nguyen

const requireOwner = (req, res, next) => {
    if (req.user.role !== "owner") {
        // thomas: `error` or `message`?
        return res.status(403).json({ message: "Owner access required" }); 
    }
    next();
};

module.exports = requireOwner;