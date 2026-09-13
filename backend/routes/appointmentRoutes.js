const express = require("express");

const router = express.Router();

const {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus
} = require("../controllers/appointmentController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

router.get(
  "/available-slots",
  authenticate,
  getAvailableSlots
);

router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createAppointment
);




router.get(
  "/my",
  authenticate,
  authorize("CUSTOMER"),
  getMyAppointments
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  getAllAppointments
);



router.get(
  "/:id",
  authenticate,
  getAppointmentById
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize(
    "CUSTOMER",
    "ADMIN",
    "SALON_OWNER",
    "MANAGER"
  ),
  cancelAppointment
);



router.patch(
  "/:id/status",
  authenticate,
  authorize(
    "ADMIN",
    "SALON_OWNER",
    "MANAGER"
  ),
  updateAppointmentStatus
);


module.exports = router;