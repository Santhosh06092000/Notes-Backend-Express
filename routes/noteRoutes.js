const express = require("express");
const authendicateToke = require("../middleware/jwt_auth");
const {
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getOneNote,
  generatePDF,
  sendPDFEmail,
} = require("../controllers/noteController");

const router = express.Router();

router.get("/", authendicateToke, getNote);
router.get("/:id", authendicateToke, getOneNote);
router.post("/", authendicateToke, createNote);
router.post("/pdf", authendicateToke, generatePDF);
router.post("/send-email", authendicateToke, sendPDFEmail);
router.put("/:id", authendicateToke, updateNote);
router.delete("/:id", authendicateToke, deleteNote);

module.exports = router;
