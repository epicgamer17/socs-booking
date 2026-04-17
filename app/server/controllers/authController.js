const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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







//our db is id, email, password, role 

//--------Login--------
//note for login when comparing password you will need to do 
//bcrypt.compare(enteredPassword, hashedPassword)
//in order to check if it's correct 
//also here a jwt token needs to be generated and stuff. 
//also need to check if password and username is correct and matches db!
exports.login = async (req, res) => {
    //remove any trailing whitespaces
    const email = req.body.email.trim();
    const enteredPassword = req.body.password.trim();
    
    //check if email and password provided
    if (!email || !enteredPassword) {
        return res.status(400).json({ message: "missing fields" });
    }

    try {
        // fetch user credentials
        const [users] = await db.query(
            `SELECT 
              users.password AS hashedPassword,
              users.id AS id,
              users.role as role
             FROM users
             WHERE users.email = ?`,
            [email]
        );

        const user = users[0];
        if (!user) {
            // no user found
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const hashedPassword = user.hashedPassword;
        
        if (!(await bcrypt.compare(enteredPassword, hashedPassword))) {
            // wrong password
            return res.status(401).json({ message: "Invalid credentials" }); 
        }

        // login successful: send back JWT token expiring in 1h
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ message: "User logged in successfully", token });

    } catch (error) {
        res.status(500).json({ message: 'Invalid credentials', error: error.message });
    }
}


//--------Logout--------

//whatever else