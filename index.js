require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const noteRoutes = require("./routes/noteRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = 8000;

connectDB();

app.use(express.json());
app.use(cors());
app.use("/notes", noteRoutes);
app.use("/", userRoutes);

app.listen(port, () => {
  console.log(`Port listening ${port}`);
});
