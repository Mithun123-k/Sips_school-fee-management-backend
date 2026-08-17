
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const createDefaultAdmin = require("./config/createAdmin");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();

    await createDefaultAdmin();

   app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server Running On Port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();