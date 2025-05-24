const Note = require("../models/Note");

// get
const getNote = async (req, res) => {
  const notes = await Note.find({
    user: req.user.id,
  });
  res.status(200).send(notes);
};

// get one by id
const getOneNote = async (req, res) => {
  const note = await Note.findById({ _id: req.params.id });
  res.status(200).send(note);
};

// create
const createNote = async (req, res) => {
  const { note_title, note_content } = req.body;
  console.log(req.user._id);

  const note = new Note({ note_title, note_content, user: req.user.id });
  await note.save();
  res.status(201).json(note);
};

// update
const updateNote = async (req, res) => {
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { note_title: req.body.note_title, note_content: req.body.note_content },
    { new: true }
  );
  res.json(note);
};

// delete
const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  console.log(note);

  res.json({ message: "Note deleted" });
};

module.exports = { getNote, createNote, updateNote, deleteNote, getOneNote };
