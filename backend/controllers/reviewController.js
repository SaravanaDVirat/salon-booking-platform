const mongoose = require("mongoose");
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Salon = require("../models/Salon");




const createReview = async (req, res) => {
  try {

    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({
        message: "Appointment ID and rating are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5"
      });
    }


    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    if (appointment.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You can review only your own appointment"
      });
    }

    if (appointment.status !== "COMPLETED") {
      return res.status(400).json({
        message: "You can review only completed appointments"
      });
    }

    const existingReview = await Review.findOne({
      appointment: appointmentId
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this appointment"
      });
    }

    const review = await Review.create({
      customer: req.user.userId,
      salon: appointment.salon,
      appointment: appointment._id,
      rating,
      comment
    });


    res.status(201).json({
      message: "Review submitted successfully",
      review
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });
  }
};

const getSalonReviews = async (req, res) => {
  try {
    const { salonId } = req.params;

    if (!salonId) {
      return res.status(400).json({
        message: "Salon ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      return res.status(400).json({
        message: "Invalid salon ID",
      });
    }

    const reviews = await Review.find({
      salon: salonId,
    })
      .populate("customer", "name email")
      .populate("salon", "name city")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get salon reviews error:", error);

    return res.status(500).json({
      message: "Failed to fetch salon reviews",
      error: error.message,
    });
  }
};


const getSalonRating = async (req, res) => {
  try {
    const { salonId } = req.params;
    if (!salonId) {
      return res.status(400).json({
        message: "Salon ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(salonId)) {
      return res.status(400).json({
        message: "Invalid salon ID",
      });
    }

    const result = await Review.aggregate([
      {
        $match: {
          salon: new mongoose.Types.ObjectId(salonId),
        },
      },
      {
        $group: {
          _id: "$salon",

          averageRating: {
            $avg: "$rating",
          },

          totalReviews: {
            $sum: 1,
          },
        },
      },
    ]);
    if (result.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalReviews: 0,
      });
    }

    const averageRating = Number(
      Number(result[0].averageRating).toFixed(1)
    );

    return res.status(200).json({
      averageRating,
      totalReviews: result[0].totalReviews,
    });
  } catch (error) {
    console.error("Get salon rating error:", error);

    return res.status(500).json({
      message: "Failed to calculate salon rating",
      error: error.message,
    });
  }
};



module.exports = {
  createReview,
  getSalonReviews,
  getSalonRating
};