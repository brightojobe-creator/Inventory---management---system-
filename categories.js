const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories ORDER BY name");
  res.json({ success: true, data: rows });
});

router.post("/", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
  try {
    const [result] = await db.query("INSERT INTO categories (name) VALUES (?)", [name]);
    res.status(201).json({ success: true, id: result.insertId, message: "Category added" });
  } catch {
    res.status(409).json({ success: false, message: "Category already exists" });
  }
});

router.put("/:id", async (req, res) => {
  const name = String(req.body.name || "").trim();
  if (!name) return res.status(400).json({ success: false, message: "Category name is required" });
  const [result] = await db.query("UPDATE categories SET name=? WHERE id=?", [name, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ success: false, message: "Category not found" });
  res.json({ success: true, message: "Category updated" });
});

router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM categories WHERE id=?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch {
    res.status(400).json({ success: false, message: "Cannot delete a category used by products" });
  }
});

module.exports = router;
