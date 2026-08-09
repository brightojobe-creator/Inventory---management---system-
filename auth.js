const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Name, valid email and password of at least 6 characters are required"
      });
    }

    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name.trim(), email.trim().toLowerCase(), hash]
    );

    const user = { id: result.insertId, name: name.trim(), email: email.trim().toLowerCase() };
    res.status(201).json({ success: true, token: signToken(user), user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      String(email || "").trim().toLowerCase()
    ]);

    if (!rows.length || !(await bcrypt.compare(password || "", rows[0].password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = { id: rows[0].id, name: rows[0].name, email: rows[0].email };
    res.json({ success: true, token: signToken(user), user });
  } catch {
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

module.exports = router;
