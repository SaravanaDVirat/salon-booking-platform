const express = require("express");

const {
  createService,
  getSalonServices,
  getServiceById,
  updateService,
  deleteService,
  activateService,
  getSalonServicesForManagement
} = require("../controllers/serviceController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/salon/:salonId",
  getSalonServices
);

router.get(
  "/:id",
  getServiceById
);


router.post(
  "/",
  authenticate,
  authorize("SALON_OWNER", "MANAGER", "ADMIN"),
  createService
);

router.put(
  "/:id",
  authenticate,
  authorize("SALON_OWNER", "MANAGER", "ADMIN"),
  updateService
);

router.delete(
  "/:id",
  authenticate,
  authorize("SALON_OWNER", "MANAGER", "ADMIN"),
  deleteService
);

router.patch(
  "/:id/activate",
  authenticate,
  authorize("SALON_OWNER", "MANAGER", "ADMIN"),
  activateService
);

router.get(
  "/salon/:salonId/manage",
  authenticate,
  authorize("SALON_OWNER", "MANAGER", "ADMIN"),
  getSalonServicesForManagement
);

module.exports = router;