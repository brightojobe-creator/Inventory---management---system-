const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM suppliers ORDER BY name");
  res.json({ success: true, data: rows });
});

router.post("/", async (req, res) => {
  const { name, phone, email } = req.body;
  if (!String(name || "").trim()) {
    return res.status(400).json({ success: false, message: "Supplier name is required" });
  }
  const [result] = await db.query(
    "INSERT INTO suppliers (name, phone, email) VALUES (?, ?, ?)",
    [String(name).trim(), phone || null, email || null]
  );
  res.status(201).json({ success: true, id: result.insertId, message: "Supplier added" });
});

router.put("/:id", async (req, res) => {
  const { name, phone, email } = req.body;
  const [result] = await db.query(
    "UPDATE suppliers SET name=?, phone=?, email=? WHERE id=?",
    [String(name || "").trim(), phone || null, email || null, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: "Supplier not found" });
  res.json({ success: true, message: "Supplier updated" });
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM suppliers WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Supplier not found" });
    res.json({ success: true, message: "Supplier deleted" });
  } catch {
    res.status(400).json({ success: false, message: "Cannot delete a supplier used by products" });
  }
});

module.exports = router;
