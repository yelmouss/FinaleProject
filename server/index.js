//server.js

const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();
const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

// Connexion à la base de données MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

//header d'accès global à l'API
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
// Importer les routes d'authentification
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);




app.get("/api/public", (req, res) => {
  res.status(200).send({
    data: "test",
  });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

