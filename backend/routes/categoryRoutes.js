const express = require("express");

const {
  createCategory,
  getCategories,
  getAllCategoriesForAdmin,
  getCategoryById,
  updateCategory,
  deleteCategory,
  activateCategory
} = require("../controllers/categoryController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getCategories);

router.get("/:id", getCategoryById);


router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  getAllCategoriesForAdmin
);
router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  createCategory
);
router.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  deleteCategory
);
router.patch(
  "/:id/activate",
  authenticate,
  authorize("ADMIN"),
  activateCategory
);


module.exports = router;