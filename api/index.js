const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000; // Use the provided port by Vercel or default to 3000

app.use(cors()); // Allow all origins

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


const jwt = require("jsonwebtoken");
const moment = require("moment");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase";
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

const User = require("./models/user");
const Todo = require("./models/todo");

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("Email already registered");
    }

    const newUser = new User({
      name,
      email,
      password,
    });

    await newUser.save();

    res.status(202).json({ message: "User registered successfully" });
  } catch (error) {
    console.log("Error registering the user", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");

  return secretKey;
};

const secretKey = generateSecretKey();

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    jwt.sign({ userId: user._id }, secretKey, (error, token) => {
      if (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ message: "Token generation failed" });
      }
      console.log("Token generated successfully:", token);
      res.status(200).json({ token, userId: user._id });
    });
  } catch (error) {
    console.log("Login failed", error);
    res.status(500).json({ message: "Login failed" });
  }
});



app.post("/todos/:userId", async(req, res) => {
  try{
    const userId = req.params.userId
    const {title, category, dueDate} = req.body;

    const newTodo = new Todo ({
      userId,
      title,
      category,
      dueDate: moment(dueDate).format("YYYY-MM-DD")
    })

    await newTodo.save();

    const user = await User.findById(userId);
    if (!user){
      res.status(404).json({error: "User not found"})
    }

    user?.todos.push(newTodo._id);
    await user.save();

    res.status(200).json({message: "Todo added successfully", todo: newTodo});
  }catch(error) {
    res.status(500).json({message: "Todo not added"})
  }
})

app.get("/users/:userId/todos", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("todos");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ todos: user.todos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log("Error fetching user information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.patch("/todos/:todoId/complete", async (req, res) => {
  try {
    const todoId = req.params.todoId;

    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      {
        status: "completed",
      },
      { new: true }
    );

    if (!updatedTodo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.status(200).json({ message: "Todo marked as complete", todo: updatedTodo });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/todos/completed/:date/:userId", async (req, res) => {
  try {
    const date = req.params.date;
    const user = req.params.userId;

    // Get the timezone offset in minutes
    const timezoneOffset = (new Date()).getTimezoneOffset();
    // Convert the offset to milliseconds
    const timezoneOffsetMs = timezoneOffset * 60 * 1000;
    // Calculate the adjusted date range
    const startOfDay = new Date(`${date}T00:00:00.000Z`).getTime() + timezoneOffsetMs;
    const endOfDay = new Date(`${date}T23:59:59.999Z`).getTime() + timezoneOffsetMs;

    const completedTodos = await Todo.find({
      userId: user,
      status: "completed",
      createdAt: {
        $gte: new Date(startOfDay),
        $lt: new Date(endOfDay),
      }
    }).exec();

    res.status(200).json({ completedTodos });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.get("/todos/:userId/count", async (req, res) => {
  const userId = req.params.userId;

  try{
    const totalCompletedTodos = await Todo.countDocuments({
      userId: userId,
      status: "completed",
    }).exec();

    const totalPendingTodos = await Todo.countDocuments({
      userId: userId,
      status: "pending",
    }).exec();

    res.status(200).json({totalCompletedTodos, totalPendingTodos})
  }catch(error) {
    res.status(500).json({ error: "Network error"});
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  try {
    const todoId = req.params.todoId;
    
    const deletedTodo = await Todo.findByIdAndDelete(todoId);
    
    if (!deletedTodo) {
      return res.status(404).json({ error: "Task not found" });
    }
    
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {

    console.log("Error deleting task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});