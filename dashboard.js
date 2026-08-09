const express = require("express");
const db = require("../db");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

router.get("/", async (req, res) => {
  const [[products]] = await db.query("SELECT COUNT(*) AS total FROM products");
  const [[categories]] = await db.query("SELECT COUNT(*) AS total FROM categories");
  const [[suppliers]] = await db.query("SELECT COUNT(*) AS total FROM suppliers");
  const [[stock]] = await db.query("SELECT COALESCE(SUM(quantity),0) AS total FROM products");
  const [[low]] = await db.query("SELECT COUNT(*) AS total FROM products WHERE quantity <= reorder_level");

  res.json({
    success: true,
    data: {
      products: products.total,
      categories: categories.total,
      suppliers: suppliers.total,
      stock: stock.total,
      lowStock: low.total
    }
  });
});

module.exports = router;
