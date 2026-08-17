const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});

// Get all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM expenses ORDER BY date DESC, id DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Could not get expenses" });
  }
});

// Add expense
app.post("/api/expenses", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;

    if (!title || !amount || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)",
      [title, amount, category, date]
    );

    const [rows] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Could not add expense" });
  }
});

// Update expense
app.put("/api/expenses/:id", async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const { id } = req.params;

    await pool.query(
      "UPDATE expenses SET title = ?, amount = ?, category = ?, date = ? WHERE id = ?",
      [title, amount, category, date, id]
    );

    const [rows] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Could not update expense" });
  }
});

// Delete expense
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ message: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete expense" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
