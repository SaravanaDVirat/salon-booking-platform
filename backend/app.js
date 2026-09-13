const express = require("express");
const cors = require("cors");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const salonRoutes = require("./routes/salonRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const staffRoutes = require("./routes/staffRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");



const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

app.get("/", (req, res) => {
  res.json({
    message: "Salon Booking API is running"
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/salons", salonRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/admin", adminRoutes);

module.exports = app;