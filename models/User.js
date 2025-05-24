const mongoose = require("mongoose");

const userShema = new mongoose.Schema({
  user_name: { type: String, required: true },
  user_email: { type: String, required: true },
  password: { type: String, required: true },
  last_update: { type: Date, default: Date.now },
  created_on: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userShema);
