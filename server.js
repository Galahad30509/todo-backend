const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

app.use(cors());
app.use(express.json());

// ==================== CONFIG ====================
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ==================== MONGODB ====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ==================== MODELS ====================
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    email: { type: String, required: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
const Task = mongoose.model("Task", TaskSchema);

// ==================== AUTH MIDDLEWARE ====================
const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ==================== REGISTER ====================
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      email,
      password: hashed,
    });

    res.json({ message: "register success" });
  } catch {
    res.status(500).json({ error: "Register error" });
  }
});

// ==================== LOGIN ====================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Wrong password" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, email: user.email });
  } catch {
    res.status(500).json({ error: "Login error" });
  }
});

// ==================== GET TASK ====================
app.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ email: req.user.email }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: "Fetch error" });
  }
});

// ==================== ADD TASK ====================
app.post("/tasks", auth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Missing title" });
    }

    const newTask = await Task.create({
      title,
      email: req.user.email,
    });

    res.json(newTask);
  } catch {
    res.status(500).json({ error: "Create error" });
  }
});

// ==================== DELETE TASK ====================
app.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "deleted" });
  } catch {
    res.status(500).json({ error: "Delete error" });
  }
});

// ==================== UPDATE TASK ====================
app.put("/tasks/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // EDIT
    if (title !== undefined) {
      task.title = title;
    }
    // TOGGLE
    else {
      task.done = !task.done;
    }

    await task.save();

    res.json(task);
  } catch {
    res.status(500).json({ error: "Update error" });
  }
});

// ==================== HEALTH ====================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});