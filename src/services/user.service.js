const userRepository = require("../repositories/user.repository");
const { hashPassword } = require("../utils/password");

exports.createReceptionist = async (data) => {
  const { name, email, mobile, password } = data;

  // Check existing mobile
  const existingUser = await userRepository.findByMobile(mobile);

  if (existingUser) {
    throw new Error("Mobile number already registered");
  }

  const hashedPassword = await hashPassword(password);

  const user = await userRepository.createUser({
    name,
    email,
    mobile,
    password: hashedPassword,
    role: "RECEPTIONIST",
  });

  return user;
};

exports.getAllReceptionists = async () => {
    return await userRepository.getAllReceptionists();
  };

exports.getReceptionist = async (id) => {
    const user =
      await userRepository.getReceptionistById(id);

    if (!user)
      throw new Error("Receptionist not found");

    return user;
  };

exports.updateReceptionist = async (id, body) => {

    const user =
      await userRepository.updateReceptionist(
        id,
        body
      );

    if (!user)
      throw new Error("Receptionist not found");

    return user;
  };

exports.deleteReceptionist = async (id) => {

    const user =
      await userRepository.deleteReceptionist(
        id
      );

    if (!user)
      throw new Error("Receptionist not found");

    return;
  };