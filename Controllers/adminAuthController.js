const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("../Models/AdminModel");

const JWT_SECRET = "your_jwt_secret_key";

// Register Admin
exports.register = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password)
      return res.status(400).json({ error: "Email and Password are required" });

    const existingAdmin = await Admin.findOne({ where: { Email } });
    if (existingAdmin)
      return res.status(400).json({ error: "Admin already exists" });

    const newAdmin = await Admin.create({ Email, Password });
    res.status(201).json({ message: "Admin registered successfully", adminId: newAdmin.AdminId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Login Admin
exports.login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    if (!Email || !Password)
      return res.status(400).json({ error: "Email and Password required" });

    const admin = await Admin.findOne({ where: { Email } });
    if (!admin)
      return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(Password, admin.Password);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { adminId: admin.AdminId, email: admin.Email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};
