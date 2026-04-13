const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== MONGODB ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ==================== MODEL ====================
const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    email: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

// ==================== LOGIN ====================
app.post("/login", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  res.json({
    message: "login success",
    email,
  });
});

// ==================== GET TASK ====================
app.get("/tasks/:email", async (req, res) => {
  try {
    const tasks = await Task.find({ email: req.params.email }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Fetch error" });
  }
});

// ==================== ADD TASK ====================
app.post("/tasks", async (req, res) => {
  try {
    const { title, email } = req.body;

    if (!title || !email) {
      return res.status(400).json({ error: "Missing data" });
    }

    const newTask = await Task.create({
      title,
      email,
    });

    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Create error" });
  }
});

// ==================== DELETE TASK ====================
app.delete("/tasks/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete error" });
  }
});

// ==================== UPDATE TASK (EDIT + TOGGLE) ====================
app.put("/tasks/:id", async (req, res) => {
  try {
    const { title } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 🔥 ถ้ามี title = EDIT
    if (title !== undefined) {
      task.title = title;
    } 
    // 🔥 ถ้าไม่มี = TOGGLE
    else {
      task.done = !task.done;
    }

    await task.save();

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Update error" });
  }
});

// ==================== HEALTH CHECK ====================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});