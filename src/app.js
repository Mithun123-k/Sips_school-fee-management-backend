const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const errorHandler = require("./middleware/error.middleware");

const studentRoutes = require("./routes/student.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const feeRoutes = require("./routes/fee.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const mongoose = require("mongoose");
const Student = require("./models/Student"); // apne actual path ke according








const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Fee Management API Running 🚀",
  });
});


app.get("/get-test", async (req, res) => {
  try {
    console.log("🔥 GET TEST HIT");

    console.log("MongoDB state:", mongoose.connection.readyState);

    const students = await Student.find({}).limit(10);

    console.log("🔥 MongoDB query successful");
    console.log("🔥 Students:", students.length);

    return res.status(200).json({
      success: true,
      message: "GET + MongoDB working",
      count: students.length,
      students,
    });
  } catch (error) {
    console.error("❌ MongoDB GET ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student-list", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard",dashboardRoutes);

// Error middleware ALWAYS LAST
app.use(errorHandler);

module.exports = app;