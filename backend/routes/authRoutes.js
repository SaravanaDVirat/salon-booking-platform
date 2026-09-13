const express = require("express");

const {
  register,
  login,
  registerSalonOwner
} = require("../controllers/authController");
const { adminLogin } = require("../controllers/adminController");

const router = express.Router();

router.post("/admin/login", adminLogin);

router.post("/register", register);
router.post("/login", login);
router.post("/register/salon-owner", registerSalonOwner);

module.exports = router;