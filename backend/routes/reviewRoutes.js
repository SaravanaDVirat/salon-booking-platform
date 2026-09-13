const express = require("express");

const router = express.Router();

const {
  createReview,
  getSalonReviews,
  getSalonRating
} = require("../controllers/reviewController");

const {
  authenticate,
  authorize
} = require("../middleware/authMiddleware");


router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  createReview
);

router.get(
  "/salon/:salonId",
  authenticate,
  getSalonReviews
);

router.get(
  "/salon/:salonId/rating",
  authenticate,
  getSalonRating
);


module.exports = router;