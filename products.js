const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

const baseQuery = `
  SELECT p.id, p.name, p.sku, p.price, p.quantity, p.reorder_level,
         p.category_id, c.name AS category, p.supplier_id, s.name AS supplier
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN suppliers s ON s.id = p.supplier_id
`;

router.get("/", async (req, res) => {
  const search = String(req.query.search || "").trim();
  const category = req.query.category;
  const params = [];
  let query = baseQuery + " WHERE 1=1";

  if (search) {
    query += " AND (p.name LIKE ? OR p.sku LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    query += " AND p.category_id = ?";
    params.push(category);
  }
  query += " ORDER BY p.id DESC";

  const [rows] = await db.query(query, params);
  res.json({ success: true, data: rows });
});

router.get("/:id", async (req, res) => {
  const [rows] = await db.query(baseQuery + " WHERE p.id=?", [req.params.id]);
  if (!rows.length) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: rows[0] });
});

router.post("/", async (req, res) => {
  const { name, sku, price, quantity, reorder_level, category_id, supplier_id } = req.body;
  if (!name || !sku || price == null || quantity == null || !category_id || !supplier_id) {
    return res.status(400).json({ success: false, message: "All product fields are required" });
  }
  try {
    const [result] = await db.query(
      `INSERT INTO products
       (name, sku, price, quantity, reorder_level, category_id, supplier_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [String(name).trim(), String(sku).trim(), Number(price), Number(quantity),
       Number(reorder_level || 5), Number(category_id), Number(supplier_id)]
    );
    res.status(201).json({ success: true, id: result.insertId, message: "Product added" });
  } catch {
    res.status(409).json({ success: false, message: "SKU already exists or related record is invalid" });
  }
});

router.put("/:id", async (req, res) => {
  const { name, sku, price, quantity, reorder_level, category_id, supplier_id } = req.body;
  const [result] = await db.query(
    `UPDATE products SET name=?, sku=?, price=?, quantity=?, reorder_level=?,
     category_id=?, supplier_id=? WHERE id=?`,
    [String(name).trim(), String(sku).trim(), Number(price), Number(quantity),
     Number(reorder_level || 5), Number(category_id), Number(supplier_id), req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, message: "Product updated" });
});

router.delete("/:id", async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("DELETE FROM stock_history WHERE product_id=?", [req.params.id]);
    const [result] = await conn.query("DELETE FROM products WHERE id=?", [req.params.id]);
    if (!result.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    await conn.commit();
    res.json({ success: true, message: "Product deleted" });
  } catch {
    await conn.rollback();
    res.status(400).json({ success: false, message: "Unable to delete product" });
  } finally {
    conn.release();
  }
});

module.exports = router;
