const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 เก็บข้อมูลชั่วคราว
let tasks = [];
let idCounter = 1;

// ==================== LOGIN ====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  res.json({
    message: "login success",
    email: email,
  });
});

// ==================== GET TASK ====================
app.get("/tasks/:email", (req, res) => {
  const userTasks = tasks.filter((t) => t.email === req.params.email);
  res.json(userTasks);
});

// ==================== ADD TASK ====================
app.post("/tasks", (req, res) => {
  const { title, email } = req.body;

  const newTask = {
    id: idCounter++,
    title,
    email,
    done: false,
  };

  tasks.push(newTask);

  res.json(newTask);
});

// ==================== DELETE TASK ====================
app.delete("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);
  tasks = tasks.filter((t) => t.id !== id);
  res.json({ message: "deleted" });
});

// ==================== TOGGLE ====================
app.put("/tasks/:id", (req, res) => {
  const id = parseInt(req.params.id);

  tasks = tasks.map((t) =>
    t.id === id ? { ...t, done: !t.done } : t
  );

  res.json({ message: "updated" });
});

// 🔥 สำคัญมาก (Render ใช้ PORT นี้)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});