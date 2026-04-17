//info for owner middleware
//our db is id, email, password, role 
//role being student or owner which is assigned during registration
//so u could smth do like checking if request came from someone who is owner
//or however u want. 

const requireOwner = (req, res, next) => {
    if (req.user.role !== "owner") {
        // thomas: `error` or `message`?
        return res.status(403).json({ message: "Owner access required" }); 
    }
    next();
};

module.exports = requireOwner;