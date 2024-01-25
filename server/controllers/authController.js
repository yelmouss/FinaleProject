// authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");

require("dotenv").config();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSMAIL,
  },
});

// Fonction pour gérer l'inscription
exports.signup = async (req, res) => {
  try {
    const { username, password, FullName } = req.body;

    // Vérifier si l'e-mail est conforme
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(username)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Vérifier que le nom complet a plus de 8 caractères
    if (FullName.length < 8) {
      return res
        .status(400)
        .json({ message: "Fullname must be at least 8 characters long" });
    }

    // Vérifier que le mot de passe a au moins 8 caractères
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur
    const user = new User({ username, password: hashedPassword, FullName });
    await user.save();

     // Envoyer l'e-mail de confirmation avec le lien de redirection
     const confirmationLink = `http://localhost:3000/confirmation/${user._id}`;
     const htmlContent = `
       <!DOCTYPE html>
       <html>
       <head>
           <meta charset="utf-8">
           <title>Confirmation de votre inscription</title>
           <style>
               /* Styles CSS pour le texte de l'e-mail */
               /* Ajoutez vos styles personnalisés ici */
           </style>
       </head>
       <body>
           <p>Bonjour,</p>
           <p>Merci de vous être inscrit sur notre site.</p>
           <p>Veuillez cliquer sur le lien ci-dessous pour confirmer votre inscription :</p>
           <p><a href="${confirmationLink}">${confirmationLink}</a></p>
           <p>Cordialement,<br>Votre équipe</p>
       </body>
       </html>`;
 
     const mailOptions = {
       from: "yelmouss.devt@gmail.com",
       to: username,
       subject: "Confirmation de votre inscription",
       html: htmlContent,
     };
 
     // Utilisation d'une promesse pour l'envoi de l'e-mail
     const sendEmail = () => {
       return new Promise((resolve, reject) => {
         transporter.sendMail(mailOptions, (error, info) => {
           if (error) {
             reject(error);
           } else {
             resolve(info.response);
           }
         });
       });
     };
 
     // Envoi de l'e-mail et attendre la réponse avant de poursuivre
     const emailResponse = await sendEmail();
 
     // Si l'e-mail est envoyé avec succès, continuer le processus d'inscription
     res.status(200).json({ message: "Email sent successfully", emailResponse });
   } catch (err) {
     console.error(err);
     res.status(500).json({ message: "Internal server error " + err });
   }
 };

 
exports.confirmSignup = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Received confirmation request for userId: ", userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    if (user.confirmed) {
      console.log("User already confirmed");
      return res.status(200).json({ message: "User already confirmed" });
    }

    // Mettre à jour l'état de confirmation de l'utilisateur
    user.confirmed = true;
    await user.save();

    console.log("User confirmed successfully");
    res.redirect("http://localhost:3000/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};

// Fonction pour gérer la connexion
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Vérifier si l'utilisateur a confirmé son email
    if (!user.confirmed) {
      return res.status(401).json({ message: "Email not confirmed" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Générer un token JWT
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET,  { expiresIn: '24h' });
    // Générer un token JWT avec le champ isAdmin
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Inclure le nom complet dans la réponse JSON
    res.json({ token, FullName: user.FullName, UserEmail: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err });
  }
};