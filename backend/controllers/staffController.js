const Staff = require("../models/Staff");
const Salon = require("../models/Salon");
const User = require("../models/User");
const Service = require("../models/Service");


const hasSalonAccess = (user, salonId) => {
  if (!user || !salonId || !Array.isArray(user.salons)) {
    return false;
  }

  return user.salons.some(
    (id) => id.toString() === salonId.toString()
  );
};

const createStaff = async (req, res) => {
  try {
    const {
  salon,
  name,
  specialization,
  phone,
  workingHours,
  services
} = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Staff name is required"
      });
    }

    let salonId;
    if (req.user.role === "ADMIN") {
      if (!salon) {
        return res.status(400).json({
          message: "Salon is required"
        });
      }

      salonId = salon;
    }
    else {
      const user = await User.findById(req.user.userId);

      if (!user || !Array.isArray(user.salons) || user.salons.length === 0) {
        return res.status(403).json({
          message: "You are not associated with any salon"
        });
      }
      if (!salon) {
        return res.status(400).json({
          message: "Salon is required"
        });
      }

      if (!hasSalonAccess(user, salon)) {
        return res.status(403).json({
          message: "You can manage staff only for your salons"
        });
      }

      salonId = salon;
    }

    const salonExists =
      await Salon.findById(salonId);

    if (!salonExists) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      salonExists.owner.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to manage this salon"
      });
    }


    const profileImage = req.file
      ? `/uploads/staff/${req.file.filename}`
      : "";


    let parsedWorkingHours;

    try {
      parsedWorkingHours =
        typeof workingHours === "string"
          ? JSON.parse(workingHours)
          : workingHours;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid working hours format"
      });
    }

    let parsedServices = [];

try {
  parsedServices =
    typeof services === "string"
      ? JSON.parse(services)
      : services || [];
} catch (error) {
  return res.status(400).json({
    message: "Invalid services format"
  });
}

if (!Array.isArray(parsedServices)) {
  return res.status(400).json({
    message: "Services must be an array"
  });
}

if (parsedServices.length > 0) {
  const validServices = await Service.find({
    _id: { $in: parsedServices },
    salon: salonId,
    isActive: true
  }).select("_id");

  if (validServices.length !== parsedServices.length) {
    return res.status(400).json({
      message: "One or more selected services are invalid"
    });
  }
}

   const staff = await Staff.create({
  salon: salonId,
  name,
  specialization,
  services: parsedServices,
  phone,
  profileImage,
  workingHours: parsedWorkingHours
});


    res.status(201).json({
      message: "Staff created successfully",
      staff
    });

  } catch (error) {
    console.error(
      "Create staff error:",
      error
    );

    res.status(500).json({
      message: "Failed to create staff",
      error: error.message
    });
  }
};

const getAllStaff = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "ADMIN") {
      filter = {};
    }
    else {
      const user =
        await User.findById(
          req.user.userId
        );

      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }

      filter.salon = {
        $in: user.salons
      };
    }


    const staff =
  await Staff.find(filter)
    .populate(
      "salon",
      "name city"
    )
    .populate(
      "user",
      "name email role"
    )
    .populate(
      "services",
      "name price duration category isActive"
    );


    res.status(200).json({
      count: staff.length,
      staff
    });

  } catch (error) {
    console.error(
      "Get all staff error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch staff",
      error: error.message
    });
  }
};
const getStaffById = async (req, res) => {
  try {

    const staff =
  await Staff.findById(
    req.params.id
  )
    .populate(
      "salon",
      "name city"
    )
    .populate(
      "user",
      "name email role"
    )
    .populate(
      "services",
      "name price duration category isActive"
    );


    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }


    if (req.user.role === "ADMIN") {
      return res.status(200).json(staff);
    }
    const user =
      await User.findById(
        req.user.userId
      );


    if (
      !user ||
      !Array.isArray(user.salons) ||
      user.salons.length === 0
    ) {
      return res.status(403).json({
        message:
          "You are not associated with any salon"
      });
    }


    if (
      !staff.salon ||
      !hasSalonAccess(
        user,
        staff.salon._id
      )
    ) {
      return res.status(403).json({
        message:
          "You can access only your salon staff"
      });
    }


    res.status(200).json(staff);

  } catch (error) {

    console.error(
      "Get staff by id error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch staff",
      error: error.message
    });
  }
};

const updateStaff = async (req, res) => {
  try {

    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }

    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can update only your salon staff"
        });
      }
    }


    const {
  name,
  specialization,
  phone,
  workingHours,
  services
} = req.body;


    staff.name =
      name ?? staff.name;


    staff.specialization =
      specialization ??
      staff.specialization;

      if (services !== undefined) {
  let parsedServices;

  try {
    parsedServices =
      typeof services === "string"
        ? JSON.parse(services)
        : services;
  } catch (error) {
    return res.status(400).json({
      message: "Invalid services format"
    });
  }

  if (!Array.isArray(parsedServices)) {
    return res.status(400).json({
      message: "Services must be an array"
    });
  }

  if (parsedServices.length > 0) {
    const validServices = await Service.find({
      _id: { $in: parsedServices },
      salon: staff.salon,
      isActive: true
    }).select("_id");

    if (validServices.length !== parsedServices.length) {
      return res.status(400).json({
        message: "One or more selected services are invalid"
      });
    }
  }

  staff.services = parsedServices;
}


    staff.phone =
      phone ?? staff.phone;


    if (workingHours !== undefined) {

      try {

        staff.workingHours =
          typeof workingHours === "string"
            ? JSON.parse(workingHours)
            : workingHours;

      } catch (error) {

        return res.status(400).json({
          message:
            "Invalid working hours format"
        });

      }
    }


    if (req.file) {
      if (staff.profileImage) {

        const cleanPath =
          staff.profileImage.startsWith("/")
            ? staff.profileImage.substring(1)
            : staff.profileImage;

        const oldImagePath =
          require("path").join(
            __dirname,
            "..",
            cleanPath
          );

        try {

          if (
            require("fs").existsSync(
              oldImagePath
            )
          ) {
            require("fs").unlinkSync(
              oldImagePath
            );
          }

        } catch (deleteError) {

          console.error(
            "Failed to delete old staff image:",
            deleteError.message
          );

        }
      }


      staff.profileImage =
        `/uploads/staff/${req.file.filename}`;
    }


    await staff.save();


    res.status(200).json({
      message:
        "Staff updated successfully",
      staff
    });

  } catch (error) {

    console.error(
      "Update staff error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update staff",
      error: error.message
    });
  }
};

const deleteStaff = async (req, res) => {
  try {

    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }


    // OWNER AUTHORIZATION
    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can delete only your salon staff"
        });
      }
    }

    if (staff.profileImage) {

      const cleanPath =
        staff.profileImage.startsWith("/")
          ? staff.profileImage.substring(1)
          : staff.profileImage;

      const imagePath =
        require("path").join(
          __dirname,
          "..",
          cleanPath
        );

      try {

        if (
          require("fs").existsSync(
            imagePath
          )
        ) {
          require("fs").unlinkSync(
            imagePath
          );
        }

      } catch (deleteError) {

        console.error(
          "Failed to delete staff image:",
          deleteError.message
        );

      }
    }


    await Staff.findByIdAndDelete(
      req.params.id
    );


    res.status(200).json({
      message:
        "Staff deleted successfully"
    });

  } catch (error) {

    console.error(
      "Delete staff error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete staff",
      error: error.message
    });
  }
};
const activateStaff = async (req, res) => {
  try {

    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }


    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can manage only your salon staff"
        });
      }
    }


    staff.isActive = true;

    await staff.save();


    res.status(200).json({
      message:
        "Staff activated successfully",
      staff
    });

  } catch (error) {

    console.error(
      "Activate staff error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to activate staff",
      error: error.message
    });
  }
};

const deactivateStaff = async (req, res) => {
  try {

    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }


    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can manage only your salon staff"
        });
      }
    }


    staff.isActive = false;

    await staff.save();


    res.status(200).json({
      message:
        "Staff deactivated successfully",
      staff
    });

  } catch (error) {

    console.error(
      "Deactivate staff error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to deactivate staff",
      error: error.message
    });
  }
};

const addStaffLeave = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
      reason
    } = req.body;


    if (!startDate || !endDate) {
      return res.status(400).json({
        message:
          "Start date and end date are required"
      });
    }


    const start =
      new Date(startDate);

    const end =
      new Date(endDate);


    if (
      isNaN(start.getTime()) ||
      isNaN(end.getTime())
    ) {
      return res.status(400).json({
        message:
          "Invalid date"
      });
    }


    if (start > end) {
      return res.status(400).json({
        message:
          "Start date cannot be after end date"
      });
    }


    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message:
          "Staff not found"
      });
    }
    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can manage leave only for your salon staff"
        });
      }
    }

    const overlappingLeave =
      staff.leaves.some(
        (leave) => {

          const existingStart =
            new Date(
              leave.startDate
            );

          const existingEnd =
            new Date(
              leave.endDate
            );


          return (
            start <= existingEnd &&
            end >= existingStart
          );

        }
      );


    if (overlappingLeave) {
      return res.status(400).json({
        message:
          "Staff already has leave during this period"
      });
    }


    staff.leaves.push({
      startDate: start,
      endDate: end,
      reason
    });


    await staff.save();


    res.status(201).json({
      message:
        "Staff leave added successfully",
      staff
    });

  } catch (error) {

    console.error(
      "Add staff leave error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to add staff leave",
      error: error.message
    });
  }
};
const removeStaffLeave = async (
  req,
  res
) => {
  try {

    const {
      leaveIndex
    } = req.params;


    const staff =
      await Staff.findById(
        req.params.id
      );


    if (!staff) {
      return res.status(404).json({
        message:
          "Staff not found"
      });
    }
    if (req.user.role !== "ADMIN") {

      const user =
        await User.findById(
          req.user.userId
        );


      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
        return res.status(403).json({
          message:
            "You are not associated with any salon"
        });
      }


      if (
        !hasSalonAccess(
          user,
          staff.salon
        )
      ) {
        return res.status(403).json({
          message:
            "You can manage only your salon staff"
        });
      }
    }


    const index =
      Number(leaveIndex);


    if (
      isNaN(index) ||
      index < 0 ||
      index >= staff.leaves.length
    ) {
      return res.status(404).json({
        message:
          "Leave not found"
      });
    }


    staff.leaves.splice(
      index,
      1
    );


    await staff.save();


    res.status(200).json({
      message:
        "Staff leave removed successfully",
      staff
    });

  } catch (error) {

    console.error(
      "Remove staff leave error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to remove staff leave",
      error: error.message
    });
  }
};

const getStaffByService = async (req, res) => {
  try {
    const { salonId, serviceId } = req.params;

    if (!salonId || !serviceId) {
      return res.status(400).json({
        message: "Salon ID and Service ID are required"
      });
    }

    const salon = await Salon.findById(salonId).select(
      "name city address isActive"
    );

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

    const service = await Service.findOne({
      _id: serviceId,
      salon: salonId,
      isActive: true
    }).populate(
      "category",
      "name description"
    );

    if (!service) {
      return res.status(404).json({
        message: "Service not found in this salon"
      });
    }

    const staff = await Staff.find({
      salon: salonId,
      services: serviceId,
      isActive: true
    })
      .select(
        "name specialization services phone profileImage workingHours isActive"
      )
      .populate(
        "services",
        "name price duration category isActive"
      )
      .sort({
        name: 1
      });

    return res.status(200).json({
      count: staff.length,

      salon: {
        id: salon._id,
        name: salon.name,
        city: salon.city
      },

      service: {
        id: service._id,
        name: service.name,
        category: service.category
      },

      staff
    });

  } catch (error) {
    console.error(
      "Get staff by service error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch staff for service",
      error: error.message
    });
  }
};

const getStaffAvailability = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: "Date is required"
      });
    }

    const selectedDate = new Date(date);

    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid date"
      });
    }

    const staff = await Staff.findById(req.params.id)
      .populate(
        "salon",
        "name city owner isActive"
      );

    if (!staff) {
      return res.status(404).json({
        message: "Staff not found"
      });
    }
    if (!staff.salon) {
      return res.status(400).json({
        message: "Staff is not associated with a salon"
      });
    }

    if (!staff.salon.isActive) {
      return res.status(200).json({
        available: false,
        reason: "Salon is currently inactive"
      });
    }
    if (!staff.isActive) {
      return res.status(200).json({
        available: false,
        reason: "Staff is currently inactive"
      });
    }
    const onLeave = staff.leaves.some((leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);

      return (
        selectedDate >= start &&
        selectedDate <= end
      );
    });

    if (onLeave) {
      return res.status(200).json({
        available: false,
        reason: "Staff is on leave"
      });
    }


    const dayMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY"
    ];

    const day = dayMap[selectedDate.getUTCDay()];

    const workingHour = staff.workingHours.find(
      (item) => item.day === day
    );

    if (!workingHour) {
      return res.status(200).json({
        available: false,
        reason: "Working hours not configured for this day"
      });
    }

    if (!workingHour.isWorking) {
      return res.status(200).json({
        available: false,
        reason: "Staff is not working on this day"
      });
    }

    return res.status(200).json({
      available: true,

      date,

      day,

      workingHours: {
        startTime: workingHour.startTime,
        endTime: workingHour.endTime
      },

      staff: {
        id: staff._id,
        name: staff.name,
        specialization: staff.specialization,
        salon: staff.salon
      }
    });

  } catch (error) {
    console.error(
      "Get staff availability error:",
      error
    );

    return res.status(500).json({
      message: "Failed to check staff availability",
      error: error.message
    });
  }
};


module.exports = {

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

};