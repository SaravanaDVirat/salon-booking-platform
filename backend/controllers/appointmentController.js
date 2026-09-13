const Appointment = require("../models/Appointment");
const Salon = require("../models/Salon");
const Service = require("../models/Service");
const Staff = require("../models/Staff");

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
};


const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};


const getDayName = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);

  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
  ];

  return days[date.getUTCDay()];
};


const getDateObject = (dateString) => {
  return new Date(`${dateString}T00:00:00.000Z`);
};


const getAvailableSlots = async (req, res) => {
  try {
    const { salonId, serviceId, staffId, date } = req.query;

    if (!salonId || !serviceId || !staffId || !date) {
      return res.status(400).json({
        message: "salonId, serviceId, staffId and date are required"
      });
    }
    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (!salon.isActive) {
      return res.status(400).json({
        message: "Salon is inactive"
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        message: "Service is inactive"
      });
    }

    if (service.salon.toString() !== salonId) {
      return res.status(400).json({
        message: "Service does not belong to this salon"
      });
    }

    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    if (!staff.isActive) {
      return res.status(400).json({
        message: "Staff is inactive"
      });
    }

    if (staff.salon.toString() !== salonId) {
      return res.status(400).json({
        message: "Staff does not belong to this salon"
      });
    }

    if (!staff.services.some(
  (id) => id.toString() === serviceId
)) {
  return res.status(400).json({
    message: "Staff is not assigned to this service"
  });
}


    const dayName = getDayName(date);



    const workingHour = staff.workingHours.find(
      (item) =>
        item.day === dayName &&
        item.isWorking === true
    );

    if (!workingHour) {
      return res.status(200).json({
        date,
        day: dayName,
        slots: []
      });
    }

    const selectedDate = getDateObject(date);

    const hasLeave = staff.leaves.some((leave) => {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      return (
        selectedDate >= startDate &&
        selectedDate <= endDate
      );
    });

    if (hasLeave) {
      return res.status(200).json({
        date,
        day: dayName,
        slots: []
      });
    }

    const duration = service.duration;

    const appointments = await Appointment.find({
      salon: salonId,
      staff: staffId,
      appointmentDate: selectedDate,

      status: {
        $nin: ["CANCELLED", "REJECTED"]
      }
    });


    const openingMinutes = timeToMinutes(
      workingHour.startTime
    );

    const closingMinutes = timeToMinutes(
      workingHour.endTime
    );


    const slots = [];
    const SLOT_INTERVAL = 15;


    for (
      let start = openingMinutes;
      start + duration <= closingMinutes;
      start += SLOT_INTERVAL
    ) {

      const end = start + duration;

      const startTime = minutesToTime(start);
      const endTime = minutesToTime(end);


      const isBooked = appointments.some((appointment) => {

        const appointmentStart =
          timeToMinutes(appointment.startTime);

        const appointmentEnd =
          timeToMinutes(appointment.endTime);

        return (
          start < appointmentEnd &&
          end > appointmentStart
        );
      });


      if (!isBooked) {
        slots.push({
          startTime,
          endTime
        });
      }
    }


    return res.status(200).json({
      date,
      day: dayName,
      serviceDuration: duration,
      staff: {
        id: staff._id,
        name: staff.name
      },
      slots
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to get available slots",
      error: error.message
    });
  }
};



const createAppointment = async (req, res) => {
  try {

    const {
      salonId,
      serviceId,
      staffId,
      appointmentDate,
      startTime,
      notes
    } = req.body;


    if (
      !salonId ||
      !serviceId ||
      !staffId ||
      !appointmentDate ||
      !startTime
    ) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const salon = await Salon.findById(salonId);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (!salon.isActive) {
      return res.status(400).json({
        message: "Salon is inactive"
      });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    if (!service.isActive) {
      return res.status(400).json({
        message: "Service is inactive"
      });
    }


    if (service.salon.toString() !== salonId) {
      return res.status(400).json({
        message: "Service does not belong to this salon"
      });
    }


    const staff = await Staff.findById(staffId);

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    if (!staff.isActive) {
      return res.status(400).json({
        message: "Staff is inactive"
      });
    }


    if (staff.salon.toString() !== salonId) {
      return res.status(400).json({
        message: "Staff does not belong to this salon"
      });
    }

    if (!staff.services.some(
  (id) => id.toString() === serviceId
)) {
  return res.status(400).json({
    message: "Staff is not assigned to this service"
  });
}

    const dateObject = getDateObject(appointmentDate);

    const dayName = getDayName(appointmentDate);


    const workingHour = staff.workingHours.find(
      (item) =>
        item.day === dayName &&
        item.isWorking === true
    );

    if (!workingHour) {
      return res.status(400).json({
        message: "Staff is not working on this day"
      });
    }

    const hasLeave = staff.leaves.some((leave) => {

      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);

      return (
        dateObject >= startDate &&
        dateObject <= endDate
      );
    });


    if (hasLeave) {
      return res.status(400).json({
        message: "Staff is on leave on this date"
      });
    }

    const startMinutes = timeToMinutes(startTime);

    const endMinutes =
      startMinutes + service.duration;

    const endTime = minutesToTime(endMinutes);


    const workingStart =
      timeToMinutes(workingHour.startTime);

    const workingEnd =
      timeToMinutes(workingHour.endTime);


    if (
      startMinutes < workingStart ||
      endMinutes > workingEnd
    ) {
      return res.status(400).json({
        message: "Selected time is outside staff working hours"
      });
    }



    const overlappingAppointment =
      await Appointment.findOne({

        salon: salonId,

        staff: staffId,

        appointmentDate: dateObject,

        status: {
          $nin: ["CANCELLED", "REJECTED"]
        },

        startTime: {
          $lt: endTime
        },

        endTime: {
          $gt: startTime
        }
      });


    if (overlappingAppointment) {
      return res.status(409).json({
        message: "Selected time slot is already booked"
      });
    }

    const appointment = await Appointment.create({

      customer: req.user.userId,

      salon: salonId,

      service: serviceId,

      staff: staffId,

      appointmentDate: dateObject,

      startTime,

      endTime,

      status: "PENDING",

      notes
    });


    const populatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("customer", "name email phone")
        .populate("salon", "name")
        .populate("service", "name price duration")
        .populate("staff", "name specialization");


    return res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Failed to create appointment",
      error: error.message
    });
  }
};

const getMyAppointments = async (req, res) => {

  try {

    const appointments =
      await Appointment.find({
        customer: req.user.userId
      })
      .populate("salon", "name phone address city images")
      .populate("service", "name price duration")
      .populate("staff", "name specialization")
      .sort({ appointmentDate: -1 });


    return res.status(200).json({
      count: appointments.length,
      appointments
    });

  } catch (error) {

    return res.status(500).json({
      message: "Failed to get appointment history",
      error: error.message
    });
  }
};

const getAllAppointments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "ADMIN") {
      query = {};
    }

    else if (req.user.role === "SALON_OWNER") {
      const salons = await Salon.find({
        owner: req.user.userId,
      }).select("_id");

      const salonIds = salons.map((salon) => salon._id);

      query = {
        salon: { $in: salonIds },
      };
    }

    else {
      return res.status(403).json({
        message: "You are not authorized to view appointments",
      });
    }

    const appointments = await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("salon", "name city address")
      .populate("service", "name price duration")
      .populate("staff", "name specialization")
      .sort({
        appointmentDate: -1,
        startTime: 1,
      });

    return res.status(200).json({
      count: appointments.length,
      appointments,
    });

  } catch (error) {
    console.error("Get all appointments error:", error);

    return res.status(500).json({
      message: "Failed to get appointments",
      error: error.message,
    });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("salon", "name phone address city")
      .populate("service", "name price duration")
      .populate("staff", "name specialization");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }
    if (req.user.role === "CUSTOMER") {
      if (
        !appointment.customer ||
        appointment.customer._id.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "You are not authorized to view this appointment",
        });
      }
    }


    if (req.user.role === "SALON_OWNER") {
      const salon = await Salon.findOne({
        _id: appointment.salon._id,
        owner: req.user.userId,
      });

      if (!salon) {
        return res.status(403).json({
          message: "You are not authorized to view this appointment",
        });
      }
    }

    if (req.user.role === "MANAGER") {
      const salon = await Salon.findOne({
        _id: appointment.salon._id,
        owner: req.user.userId,
      });

      if (!salon) {
        return res.status(403).json({
          message: "You are not authorized to view this appointment",
        });
      }
    }
    return res.status(200).json({
      appointment,
    });
  } catch (error) {
    console.error("Get appointment by ID error:", error);

    return res.status(500).json({
      message: "Failed to get appointment",
      error: error.message,
    });
  }
};
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    if (req.user.role === "CUSTOMER") {
      if (
        appointment.customer.toString() !==
        req.user.userId
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot cancel this appointment",
        });
      }
    }
    if (req.user.role === "SALON_OWNER") {
      const salon = await Salon.findOne({
        _id: appointment.salon,
        owner: req.user.userId,
      });

      if (!salon) {
        return res.status(403).json({
          success: false,
          message:
            "You cannot cancel appointments from another salon",
        });
      }
    }
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message:
          "Completed appointment cannot be cancelled",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Appointment is already cancelled",
      });
    }

    if (appointment.status === "REJECTED") {
      return res.status(400).json({
        success: false,
        message:
          "Rejected appointment cannot be cancelled",
      });
    }

    appointment.status = "CANCELLED";

    await appointment.save();

    const updatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("customer", "name email phone")
        .populate("salon", "name phone address city")
        .populate("service", "name price duration")
        .populate("staff", "name specialization");

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment,
    });

  } catch (error) {
    console.error(
      "Cancel appointment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message,
    });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "REJECTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid appointment status",
      });
    }

    const appointment =
      await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }
    if (req.user.role === "SALON_OWNER") {
      const salon = await Salon.findOne({
        _id: appointment.salon,
        owner: req.user.userId,
      });

      if (!salon) {
        return res.status(403).json({
          message:
            "You are not authorized to update this appointment",
        });
      }
    }

    appointment.status = status;

    await appointment.save();

    const updatedAppointment =
      await Appointment.findById(appointment._id)
        .populate("customer", "name email phone")
        .populate("salon", "name phone address city")
        .populate("service", "name price duration")
        .populate("staff", "name specialization");

    return res.status(200).json({
      message:
        "Appointment status updated successfully",
      appointment: updatedAppointment,
    });

  } catch (error) {
    console.error(
      "Update appointment status error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update appointment status",
      error: error.message,
    });
  }
};


module.exports = {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus
};