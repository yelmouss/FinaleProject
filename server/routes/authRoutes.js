// authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route d'inscription
router.post("/signup", authController.signup);

// Route de connexion
router.post("/login", authController.login);


router.get('/confirmation/:userId', authController.confirmSignup);



module.exports = router;