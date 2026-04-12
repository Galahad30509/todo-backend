const express = require("express");
const cors = require("cors");

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());

// ==================== TEMP DATA ====================
let tasks = [];
let idCounter = 1;

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==================== LOGIN ====================
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN:", email, password);

    res.json({
      message: "login success",
      email: email,
    });
  } catch (err) {
    res.status(500).json({ error: "Login error" });
  }
});

// ==================== GET TASK ====================
app.get("/tasks/:email", (req, res) => {
  try {
    const userTasks = tasks.filter((t) => t.email === req.params.email);
    res.json(userTasks);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// ==================== ADD TASK ====================
app.post("/tasks", (req, res) => {
  try {
    const { title, email } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const newTask = {
      id: idCounter++,
      title,
      email,
      done: false,
    };

    tasks.push(newTask);

    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Add error" });
  }
});

// ==================== DELETE TASK ====================
app.delete("/tasks/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    tasks = tasks.filter((t) => t.id !== id);

    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

// ==================== TOGGLE DONE ====================
app.put("/tasks/:id", (req, res) => {
  try {
    const id = parseInt(req.params.id);

    tasks = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );

    res.json({ message: "updated" });
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});