// User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {type: String, required : true},
  password: {type: String, required : true},
  FullName:  {type: String, required : true},
  confirmed: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false }, // Ajout du champ isAdmin
});

const User = mongoose.model("User", userSchema);

module.exports = User;