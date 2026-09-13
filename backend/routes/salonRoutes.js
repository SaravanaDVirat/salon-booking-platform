const express = require("express");

const {
  createSalon,
  getAllSalons,
  getSalonById,
  getMySalons,
  updateSalon,
  deleteSalon,
  updateSalonStatus,
  getOwnerDashboard
} = require("../controllers/salonController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");
const { salonUpload } = require("../middleware/upload");

const router = express.Router();

router.get("/", getAllSalons);

router.get(
  "/owner/dashboard",
  authenticate,
  authorize("SALON_OWNER"),
  getOwnerDashboard
);


router.get(
  "/owner/my-salons",
  authenticate,
  authorize("SALON_OWNER"),
  getMySalons
);

router.get("/:id", getSalonById);

router.post(
  "/",
  authenticate,
  authorize("SALON_OWNER"),
  salonUpload.array("images", 10),
  createSalon
);

router.put(
  "/:id",
  authenticate,
  authorize("SALON_OWNER", "ADMIN"),
  salonUpload.array("images", 10),
  updateSalon
);

router.delete(
  "/:id",
  authenticate,
  authorize("SALON_OWNER", "ADMIN"),
  deleteSalon
);

router.patch(
  "/:id/status",
  authenticate,
  authorize("SALON_OWNER", "ADMIN"),
  updateSalonStatus
);

module.exports = router;