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

    isWorking: {
      type: Boolean,
      default: true
    },

    startTime: {
      type: String
    },

    endTime: {
      type: String
    }
  },
  { _id: false }
);

const leaveSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    reason: {
      type: String
    }
  },
  { _id: false }
);

const staffSchema = new mongoose.Schema(
  {
    salon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    specialization: [
      {
        type: String
      }
    ],

    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service"
      }
    ],

    phone: {
      type: String
    },

     profileImage: {
      type: String,
      default: "",
    },

    workingHours: [workingHourSchema],

    leaves: [leaveSchema],

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Staff", staffSchema);