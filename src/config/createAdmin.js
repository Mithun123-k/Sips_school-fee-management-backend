const userRepository = require("../repositories/user.repository");
const { hashPassword } = require("../utils/password");

const createDefaultAdmin = async () => {
  try {
    const admin = await userRepository.findAdmin();

    if (admin) {
      console.log("✅ Admin already exists");
      return;
    }

    const password = await hashPassword("Admin@123");

    await userRepository.createUser({
      name: "Super Admin",
      email: "SIPSNARSINGHPUR@GMAIL.COM",
      mobile: "8839194116",
      password,
      role: "ADMIN",
    });

    console.log("✅ Default Admin Created");
  } catch (error) {
    console.log("Seeder Error :", error.message);
  }
};

module.exports = createDefaultAdmin;