const db = require("../db/db");
const bcrypt = require("bcrypt");

//--------Registration--------
exports.register = async (req, res) => {

    //remove any trailing whitespaces
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    //check if email and password provided
    if (!email || !password) {
        return res.status(400).json({ message: "missing fields" });
    }


    //if invalid email 
    if (!email.endsWith("@mcgill.ca") && !email.endsWith("@mail.mcgill.ca")) {
        return res.status(400).json({ message: "Mcgill email required " })
    }

    //if weak password 
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    //setting role 
    let role = "student";
    if (email.endsWith("@mcgill.ca")) {
        role = "owner";
    }

    try {
        //encrypt password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        //add valid user to db
        await db.query(
            "INSERT INTO users (email, password, role) VALUES( ?, ?, ? )",
            [email, hashedPassword, role]
        );
        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};








//--------Login--------
//not for login when comparing password you will need to do 
//bcrypt.compare(enteredPassword, hashedPassword)
//in order to check if it's correct 
//also here is where jwt token thingy would also happen

//--------Logout--------

//whatever else