const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== MONGODB ====================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ==================== MODEL ====================
const Task = mongoose.model("Task", {
  title: String,
  email: String,
  done: Boolean,
});

// ==================== LOGIN ====================
app.post("/login", (req, res) => {
  const { email } = req.body;

  res.json({
    message: "login success",
    email,
  });
});

// ==================== GET TASK ====================
app.get("/tasks/:email", async (req, res) => {
  const tasks = await Task.find({ email: req.params.email });
  res.json(tasks);
});

// ==================== ADD TASK ====================
app.post("/tasks", async (req, res) => {
  const { title, email } = req.body;

  const newTask = await Task.create({
    title,
    email,
    done: false,
  });

  res.json(newTask);
});

// ==================== DELETE TASK ====================
app.delete("/tasks/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "deleted" });
});

// ==================== TOGGLE DONE ====================
app.put("/tasks/:id", async (req, res) => {
  const task = await Task.findById(req.params.id);

  task.done = !task.done;
  await task.save();

  res.json({ message: "updated" });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});