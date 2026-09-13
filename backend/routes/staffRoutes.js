const express = require("express");

const router = express.Router();

const {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  activateStaff,
  deactivateStaff,
  addStaffLeave,
  removeStaffLeave,
  getStaffAvailability,
  getStaffByService
} = require("../controllers/staffController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");
const { staffUpload } = require("../middleware/upload");

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
   staffUpload.single("profileImage"),
  createStaff
);

router.get(
  "/",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  getAllStaff
);
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  getStaffById
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  staffUpload.single("profileImage"),
  updateStaff
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  deleteStaff
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  activateStaff
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize("ADMIN", "SALON_OWNER", "MANAGER"),
  deactivateStaff
);
router.post(
  "/:id/leaves",
  authenticate,
  authorize("SALON_OWNER", "MANAGER"),
  addStaffLeave
);

router.delete(
  "/:id/leaves/:leaveIndex",
  authenticate,
  authorize("SALON_OWNER", "MANAGER"),
  removeStaffLeave
);
router.get(
  "/salon/:salonId/service/:serviceId",
  getStaffByService
);
router.get(
  "/:id/availability",
  getStaffAvailability
);

module.exports = router;