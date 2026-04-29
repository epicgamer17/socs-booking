//Sophia Hussain (Registration + verify email) Thomas Nguyen(login/logout)

const db = require("../db/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


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

//--------Registration--------  
exports.register = async (req, res) => {

  //remove any trailing whitespaces
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password;
  const firstName = (req.body.firstName || "").trim();
  const lastName = (req.body.lastName || "").trim();
  const department = req.body.department;
  //check if email and password, first name, last name provided
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "missing mandatory fields" });
  }

  //if invalid email 
  if (!email.endsWith("@mcgill.ca") && !email.endsWith("@mail.mcgill.ca")) {
    return res.status(400).json({ message: "Mcgill email required " })
  }

  //if weak password 
  if (password.length < 12) {
    return res.status(400).json({ message: "Password must be at least 12 characters" });
  } else if (password.length > 72) {
    return res.status(400).json({ message: "Password too long" });
  } else if (!/[A-Z]/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one uppercase character" });
  } else if (!/\d/.test(password)) {
    return res.status(400).json({ message: "Password must contain at least one digit" });
  } else if (!/[!@#$%^&*]/.test(password)) {
    return res.status(400).json({ message: `Password must contain at least one symbol among [!@#$%^&*]` });
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
    const verifyToken = crypto.randomBytes(32).toString("hex");

    //add valid user to db
    await db.query(
      "INSERT INTO users (email, firstName, lastName, department, password, role, verifyToken) VALUES( ?, ?, ?, ?, ?, ?, ? )",
      [email, firstName, lastName, department, hashedPassword, role, verifyToken]
    );

    // send verification email
    const verifyURL = `${process.env.FRONTEND_URL}/verify/${verifyToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify your SOCS Booking account",
      html: `<p>Hi ${firstName},</p>
                   <p>Please verify your McGill Booking account by clicking the link below:</p>
                   <a href="${verifyURL}">${verifyURL}</a>`
    });

    return res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." });

  } catch (err) {
    console.error("[authController.register]", err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already registered' });
    }
    res.status(500).json({ message: 'Error creating user' });
  }
};

//--------Verify Email--------
exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE users SET isVerified = TRUE, verifyToken = NULL WHERE verifyToken = ?",
      [token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Invalid or expired verification link" });
    }

    return res.status(200).json({ message: "Email verified successfully. You can now log in." });

  } catch (err) {
    console.error("[authController.verifyEmail]", err);
    return res.status(500).json({ message: "Verification failed" });
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
              users.role as role,
              users.isVerified AS isVerified
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
    // check email is verified before allowing login
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in" });
    }

    // login successful: send back JWT token expiring in 1h
    const token = jwt.sign({ id: user.id, role: user.role, email: email }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60,   // 1h, like the token
    });

    return res.status(200).json({ message: "User logged in successfully", token });

  } catch (err) {
    console.error("[authController.login]", err);
    res.status(500).json({ message: "Server error" });
  }
};


//--------Logout--------
exports.logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

