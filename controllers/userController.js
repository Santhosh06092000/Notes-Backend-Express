const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Register
const registerUser = async (req, res) => {
  console.log("hi");

  const { user_name, user_email, password } = req.body;
  const findUserEmail = await User.findOne({ user_email: user_email });
  if (findUserEmail) {
    return res.status(403).json({ message: "User already exist" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    user_name,
    user_email,
    password: hashedPassword,
  });
  await user.save();
  res.status(200).send(user);
};

// Login
const loginUser = async (req, res) => {
  const { user_email, password } = req.query;

  const findUser = await User.findOne({ user_email: user_email });
  if (!findUser) res.status(404).json({ message: "User not register" });

  const checkCredentioal = await bcrypt.compare(password, findUser.password);
  if (!checkCredentioal)
    res.status(401).json({ message: "Wrong user credentioal" });

  const payload = {
    id: findUser.id,
    user_email: findUser.user_email,
    user_name: findUser.user_name,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ token, user: payload });
};

module.exports = { registerUser, loginUser };
