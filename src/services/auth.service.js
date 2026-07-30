const userRepository = require("../repositories/user.repository");

const {
  comparePassword,
} = require("../utils/password");

const generateToken = require("../utils/jwt");

const login = async (mobile, password) => {

  const user =
    await userRepository.findByMobile(mobile);

  if (!user)
    throw new Error("User not found");

  const isMatch =
    await comparePassword(
      password,
      user.password
    );

  if (!isMatch)
    throw new Error("Invalid Password");

  const token =
    generateToken(user);

  return {
    token,
    user,
  };
};

module.exports = {
  login,
};