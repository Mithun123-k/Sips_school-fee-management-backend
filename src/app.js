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
app.get("/get-test", (req, res) => {
  console.log("🔥 GET TEST HIT");

  res.status(200).json({
    success: true,
    message: "GET is working"
  });
});

app.post("/post-test", (req, res) => {
  console.log("🔥 POST TEST HIT");

  res.status(200).json({
    success: true,
    message: "POST is working"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/student-list", studentRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard",dashboardRoutes);

// Error middleware ALWAYS LAST
app.use(errorHandler);

module.exports = app;