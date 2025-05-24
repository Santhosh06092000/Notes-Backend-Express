const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    note_title: { type: String, required: true },
    note_content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    last_update: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
