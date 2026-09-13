const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

require("dotenv").config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: "admin@salon.com"
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      "Admin123",
      10
    );

    const admin = await User.create({
      name: "Platform Admin",
      email: "admin@salon.com",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);

    process.exit(0);

  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();