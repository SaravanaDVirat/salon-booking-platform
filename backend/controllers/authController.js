const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      userId,
      role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d"
    }
  );
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "CUSTOMER"
    });

    const token = generateToken(
      user._id,
      user.role
    );

    res.status(201).json({
      message: "Registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Customer Registration Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};
const registerSalonOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and phone are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "SALON_OWNER",
      salons: [],
      isActive: true
    });

    const token = generateToken(
      user._id,
      user.role
    );

    res.status(201).json({
      success: true,
      message: "Salon owner registration successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        salons: user.salons
      }
    });

  } catch (error) {
    console.error("Salon Owner Registration Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
const login = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated"
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = generateToken(
      user._id,
      user.role
    );

    res.status(200).json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        salons: user.salons || []
      }
    });

  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      message: "Server error"
    });
  }
};


module.exports = {
  register,
  login,
  registerSalonOwner
};