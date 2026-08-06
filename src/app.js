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
const feeStructureRoutes = require("./routes/feeStructure.routes");







const app = express();

app.use(cors({origin: [
      "http://localhost:5173",
      "https://sips-xi.vercel.app",
    ],
    credentials: true,}));
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

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/receptionist", userRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/dashboard",dashboardRoutes);
app.use("/api/fee-structures", feeStructureRoutes);

// Error middleware ALWAYS LAST
app.use(errorHandler);

module.exports = app;