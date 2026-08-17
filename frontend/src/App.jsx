import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api/expenses";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Education",
  "Bills",
  "Other"
];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    title: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0]
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadExpenses();
  }, []);

  async function loadExpenses() {
    try {
      const response = await axios.get(API);
      setExpenses(response.data);
    } catch (error) {
      alert("Cannot connect to the backend. Make sure the server is running.");
    }
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title || !form.amount || !form.category || !form.date) {
      alert("Please fill all fields.");
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API}/${editingId}`, form);
      } else {
        await axios.post(API, form);
      }

      setForm(emptyForm);
      setEditingId(null);
      loadExpenses();
    } catch (error) {
      alert("Something went wrong.");
    }
  }

  function editExpense(expense) {
    setEditingId(expense.id);
    setForm({
      title: expense.title,
      amount: expense.amount,
      category: expense.category,
      date: expense.date.split("T")[0]
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteExpense(id) {
    if (!window.confirm("Delete this expense?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      loadExpenses();
    } catch (error) {
      alert("Could not delete expense.");
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
  }

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filter === "All" || expense.category === filter;

    return matchesSearch && matchesCategory;
  });

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthTotal = expenses
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  const categoryTotals = categories.map((category) => ({
    category,
    total: expenses
      .filter((expense) => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0)
  }));

  return (
    <div className="app">
      <header>
        <h1>💰 Expense Tracker</h1>
        <p>Manage your daily expenses easily</p>
      </header>

      <main>
        <section className="cards">
          <div className="card">
            <span>Total Expenses</span>
            <strong>৳{total.toFixed(2)}</strong>
          </div>

          <div className="card">
            <span>This Month</span>
            <strong>৳{monthTotal.toFixed(2)}</strong>
          </div>

          <div className="card">
            <span>Number of Expenses</span>
            <strong>{expenses.length}</strong>
          </div>
        </section>

        <section className="panel">
          <h2>{editingId ? "✏️ Edit Expense" : "➕ Add Expense"}</h2>

          <form onSubmit={handleSubmit} className="form">
            <input
              name="title"
              placeholder="Expense title"
              value={form.title}
              onChange={handleChange}
            />

            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
            />

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>

            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />

            <button type="submit">
              {editingId ? "Update Expense" : "Add Expense"}
            </button>

            {editingId && (
              <button type="button" className="cancel" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </form>
        </section>

        <section className="panel">
          <div className="section-title">
            <h2>📋 All Expenses</h2>

            <div className="filters">
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredExpenses.length === 0 ? (
            <p className="empty">No expenses found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.title}</td>
                      <td>৳{Number(expense.amount).toFixed(2)}</td>
                      <td>{expense.category}</td>
                      <td>{expense.date.split("T")[0]}</td>
                      <td>
                        <button
                          className="edit"
                          onClick={() => editExpense(expense)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete"
                          onClick={() => deleteExpense(expense.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="panel">
          <h2>📊 Spending by Category</h2>

          <div className="category-list">
            {categoryTotals.map((item) => (
              <div className="category-row" key={item.category}>
                <span>{item.category}</span>
                <strong>৳{item.total.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>Mitali's Tiny Expense Tracker</footer>
    </div>
  );
}

export default App;
