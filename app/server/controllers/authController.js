//Sophia Hussain (Registration) Thomas Nguyen(login/logout)

const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Valid Department Codes 
const VALID_DEPARTMENTS = [
    "ACCT", "AEBI", "AECH", "AEIS", "AEMA", "AEPH", "AERO", "AFRI", "AGEC", "AGRI",
    "ANAT", "ANTH", "ARCH", "ARTH", "ATOC", "BBME", "BINF", "BIOC", "BIOL", "BIOS",
    "BPHY", "CHEE", "CHEM", "CIVE", "CLAS", "COGS", "COMP", "COMS", "ECON", "ECSE",
    "ENGL", "ENVR", "EPSC", "FINE", "FREN", "FRSL", "GEOG", "GERM", "HGEN", "HIST",
    "INDG", "INSY", "LING", "MATH", "MECH", "MGMT", "MGSC", "MIME", "MIMM", "MRKT",
    "NSCI", "NUTR", "PHAR", "PHGY", "PHIL", "PHYS", "POLI", "PSYC", "RELG", "SOCI",
    "SWRK", "URBP", "WMST"
];

//--------Registration--------   TO DO AFTER DEMO -- SEND VERIFICATION EMAIL TO CHECK IS EMAIL USED FOR REGISTRATION ACTUALLY EXISTS.
exports.register = async (req, res) => {

    //remove any trailing whitespaces
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;
    const firstName = (req.body.firstName || "").trim();
    const lastName = (req.body.lastName || "").trim();
    //if department value provided then remove trailing whitespaces
    const department = req.body.department ? req.body.department.trim() : null;
    //check if email and password, first name, last name provided
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "missing mandatory fields" });
    }

    //if invalid email 
    if (!email.endsWith("@mcgill.ca") && !email.endsWith("@mail.mcgill.ca")) {
        return res.status(400).json({ message: "Mcgill email required " })
    }

    //if weak password 
    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    //if invalid department

    if (department && !VALID_DEPARTMENTS.includes(department)) {
        return res.status(400).json({ message: "Invalid department code" })
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
            "INSERT INTO users (email, firstName, lastName, department, password, role) VALUES( ?, ?, ?, ?, ?, ? )",
            [email, firstName, lastName, department, hashedPassword, role]
        );
        return res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

//--------Login--------
exports.login = async (req, res) => {
  //remove any trailing whitespaces
  const email = (req.body.email || "").trim().toLowerCase();
  const enteredPassword = req.body.password;

  //check if email and password provided
  if (!email || !enteredPassword) {
    return res.status(400).json({ message: "missing fields" });
  }

  try {
    // fetch user credentials
    const [users] = await db.query(
      `SELECT users.password AS hashedPassword,
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
    const token = jwt.sign({ id: user.id, role: user.role, email: email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ message: "User logged in successfully", token });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//--------Logout--------
exports.logout = async (_, res) => {
  res.status(200).json({ message: "Logout successful" });
};

