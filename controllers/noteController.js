const Note = require("../models/Note");
const PDFDocument = require("pdfkit");
const { PassThrough } = require("stream");
const getStream = require("get-stream");
const { buffer } = require("stream/consumers");
const nodemailer = require("nodemailer");

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

// generate pdf
const generatePDF = async (req, res) => {
  const notes = await Note.find({ user: req.user.id });

  const noteHeader = Object.keys(notes[0]._doc ?? []).filter(
    (key) =>
      key !== "__v" &&
      key !== "_id" &&
      key !== "createdAt" &&
      key !== "updatedAt" &&
      key !== "last_update" &&
      key !== "user"
  );

  const noteRows = notes.map((note) =>
    noteHeader.map((key) => String(note[key]))
  );

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="notes.pdf"');

  doc.pipe(res);

  const tableData = {
    headers: noteHeader,
    rows: noteRows,
  };

  const drawTable = (doc, data, startX, startY) => {
    const cellWidth = 150;
    const cellHeight = 30;

    data.headers.forEach((header, i) => {
      doc.rect(startX + i * cellWidth, startY, cellWidth, cellHeight).stroke();
      doc.text(header, startX + i * cellWidth + 5, startY + 10);
    });

    data.rows.forEach((row, i) => {
      row.forEach((cell, j) => {
        doc
          .rect(
            startX + j * cellWidth,
            startY + (i + 1) * cellHeight,
            cellWidth,
            cellHeight
          )
          .stroke();

        doc.text(
          cell,
          startX + j * cellWidth + 5,
          startY + (i + 1) * cellHeight + 10
        );
      });
    });
  };

  drawTable(doc, tableData, 50, 50);
  doc.end();
};

// send email
const sendPDFEmail = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });

    if (!notes.length) {
      return res.status(404).json({ message: "No notes found" });
    }

    const noteHeader = Object.keys(notes[0]._doc ?? []).filter(
      (key) =>
        key !== "__v" &&
        key !== "_id" &&
        key !== "createdAt" &&
        key !== "updatedAt" &&
        key !== "last_update" &&
        key !== "user"
    );

    const noteRows = notes.map((note) =>
      noteHeader.map((key) => String(note[key]))
    );

    const doc = new PDFDocument();
    const stream = new PassThrough();
    doc.pipe(stream);

    const tableData = {
      headers: noteHeader,
      rows: noteRows,
    };

    const drawTable = (doc, data, startX, startY) => {
      const cellWidth = 150;
      const cellHeight = 30;

      data.headers.forEach((header, i) => {
        doc
          .rect(startX + i * cellWidth, startY, cellWidth, cellHeight)
          .stroke();
        doc.text(header, startX + i * cellWidth + 5, startY + 10);
      });

      data.rows.forEach((row, i) => {
        row.forEach((cell, j) => {
          doc
            .rect(
              startX + j * cellWidth,
              startY + (i + 1) * cellHeight,
              cellWidth,
              cellHeight
            )
            .stroke();

          doc.text(
            cell,
            startX + j * cellWidth + 5,
            startY + (i + 1) * cellHeight + 10
          );
        });
      });
    };

    drawTable(doc, tableData, 50, 50);
    doc.end();

    const pdfBuffer = await buffer(stream);

    // Configure Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // your email
        pass: process.env.GMAIL_PASS, // app password (not your login password)
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: req.user.user_email,
      subject: "Your Notes PDF",
      text: "Attached is your notes PDF.",
      attachments: [
        {
          filename: "notes.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send email" });
  }
};

module.exports = {
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getOneNote,
  generatePDF,
  sendPDFEmail,
};
