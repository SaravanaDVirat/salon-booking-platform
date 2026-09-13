const mongoose = require("mongoose");

const workingHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY"
      ],
      required: true
    },

    isOpen: {
      type: Boolean,
      default: true
    },

    openTime: {
      type: String
    },

    closeTime: {
      type: String
    }
  },
  { _id: false }
);

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    phone: {
      type: String
    },

    email: {
      type: String
    },

    address: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

   location: {
  type: String,
  trim: true,
  default: "",
},

    images: [
      {
        type: String
      }
    ],

    workingHours: [workingHourSchema],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Salon", salonSchema);