const express = require("express");

const router = express.Router();

const {
    getDashboardStats,
    getAllUsers,
    getUsersByRole,
    activateUser,
    deactivateUser,
    getAllSalons,
    activateSalon,
    deactivateSalon,
    getAllAppointments,
    getAllReviews,
    createUser,
    updateUser,
    deleteUser,
    getSalonByAdmin,
    getAllServicesAdmin,
} = require("../controllers/adminController");

const { authorize, authenticate } = require("../middleware/authMiddleware");


router.get(
    "/dashboard",
    authenticate,
    authorize("ADMIN"),
    getDashboardStats
);


router.get(
    "/users",
    authenticate,
     authorize("ADMIN"),
    getAllUsers
);

router.get(
    "/users/role/:role",
    authenticate,
     authorize("ADMIN"),
    getUsersByRole
);

router.put(
    "/users/:id/activate",
    authenticate,
     authorize("ADMIN"),
    activateUser
);

router.put(
    "/users/:id/deactivate",
    authenticate,
     authorize("ADMIN"),
    deactivateUser
);

router.get(
  "/salons/:id",
  authenticate,
  authorize("ADMIN"),
  getSalonByAdmin
);

router.get(
    "/salons",
    authenticate,
     authorize("ADMIN"),
    getAllSalons
);

router.put(
    "/salons/:id/activate",
    authenticate,
     authorize("ADMIN"),
    activateSalon
);

router.put(
    "/salons/:id/deactivate",
    authenticate,
     authorize("ADMIN"),
    deactivateSalon
);

router.get(
    "/appointments",
    authenticate,
     authorize("ADMIN"),
    getAllAppointments
);

router.get(
    "/reviews",
    authenticate,
     authorize("ADMIN"),
    getAllReviews
);

router.post(
    "/users",
    authenticate,
    authorize("ADMIN"),
    createUser
);

router.put(
    "/users/:id",
    authenticate,
    authorize("ADMIN"),
    updateUser
);

router.delete(
    "/users/:id",
    authenticate,
    authorize("ADMIN"),
    deleteUser
);

router.get(
  "/services",
  authenticate,
  authorize("ADMIN"),
  getAllServicesAdmin
);

module.exports = router;