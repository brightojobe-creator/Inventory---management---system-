const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.post("/adjust", async (req, res) => {
  const { product_id, type, quantity, note } = req.body;
  const amount = Number(quantity);

  if (!product_id || !["IN", "OUT"].includes(type) || !Number.isInteger(amount) || amount <= 0) {
    return res.status(400).json({ success: false, message: "Valid product, type and positive quantity are required" });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [products] = await conn.query(
      "SELECT quantity FROM products WHERE id=? FOR UPDATE", [product_id]
    );
    if (!products.length) throw new Error("Product not found");

    const current = products[0].quantity;
    const newQuantity = type === "IN" ? current + amount : current - amount;
    if (newQuantity < 0) throw new Error("Insufficient stock");

    await conn.query("UPDATE products SET quantity=? WHERE id=?", [newQuantity, product_id]);
    await conn.query(
      "INSERT INTO stock_history (product_id, type, quantity, note, user_id) VALUES (?, ?, ?, ?, ?)",
      [product_id, type, amount, note || null, req.user.id]
    );

    await conn.commit();
    res.json({ success: true, message: "Stock updated", newQuantity });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ success: false, message: err.message || "Stock update failed" });
  } finally {
    conn.release();
  }
});

router.get("/history", async (req, res) => {
  const [rows] = await db.query(`
    SELECT h.id, p.name AS product, h.type, h.quantity, h.note, h.created_at,
           u.name AS user
    FROM stock_history h
    JOIN products p ON p.id=h.product_id
    LEFT JOIN users u ON u.id=h.user_id
    ORDER BY h.created_at DESC
    LIMIT 100
  `);
  res.json({ success: true, data: rows });
});

module.exports = router;
