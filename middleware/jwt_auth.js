const jwt = require("jsonwebtoken");

const authendicateToke = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) res.status(401).json({ message: "No token" });

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authendicateToke;
