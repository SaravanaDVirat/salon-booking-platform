const Staff = require("../models/Staff");
const Salon = require("../models/Salon");
const User = require("../models/User");
const Service = require("../models/Service");

const cloudinary = require("cloudinary").v2;

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const hasSalonAccess = (user, salonId) => {
  if (!user || !salonId || !Array.isArray(user.salons)) {
    return false;
  }

  return user.salons.some(
    (id) => id.toString() === salonId.toString()
  );
};

/* =========================================================
   CLOUDINARY HELPERS
========================================================= */

const getCloudinaryPublicId = (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== "string") {
    return null;
  }

  try {
    if (!imageUrl.includes("res.cloudinary.com")) {
      return null;
    }

    const uploadIndex = imageUrl.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = imageUrl.substring(
      uploadIndex + "/upload/".length
    );

  
    publicId = publicId.replace(/^v\d+\//, "");

    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch (error) {
    console.error(
      "Failed to extract Cloudinary public ID:",
      error.message
    );

    return null;
  }
};

const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = getCloudinaryPublicId(imageUrl);


  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image"
    });

    console.log(
      `Cloudinary staff image deleted: ${publicId}`
    );
  } catch (error) {
    console.error(
      "Failed to delete Cloudinary staff image:",
      error.message
    );
  }
};

const cleanupUploadedFile = async (file) => {
  if (!file) {
    return;
  }

  try {
  
    if (file.public_id) {
      await cloudinary.uploader.destroy(file.public_id, {
        resource_type: "image"
      });

      console.log(
        `Cloudinary uploaded staff image cleaned up: ${file.public_id}`
      );

      return;
    }


    if (file.path) {
      const publicId = getCloudinaryPublicId(file.path);

      if (publicId) {
        await cloudinary.uploader.destroy(publicId, {
          resource_type: "image"
        });

        console.log(
          `Cloudinary uploaded staff image cleaned up: ${publicId}`
        );
      }
    }
  } catch (error) {
    console.error(
      "Failed to cleanup uploaded Cloudinary staff image:",
      error.message
    );
  }
};

/* =========================================================
   CREATE STAFF
========================================================= */

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

    /* =====================================================
       ADMIN
    ===================================================== */

    if (req.user.role === "ADMIN") {
      if (!salon) {
        return res.status(400).json({
          message: "Salon is required"
        });
      }

      salonId = salon;
    }

    /* =====================================================
       SALON OWNER
    ===================================================== */

    else {
      const user = await User.findById(req.user.userId);

      if (
        !user ||
        !Array.isArray(user.salons) ||
        user.salons.length === 0
      ) {
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

    /* =====================================================
       CHECK SALON
    ===================================================== */

    const salonExists = await Salon.findById(salonId);

    if (!salonExists) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

    if (
      req.user.role !== "ADMIN" &&
      salonExists.owner.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to manage this salon"
      });
    }

  
    const profileImage = req.file
      ? req.file.path
      : "";

    /* =====================================================
       WORKING HOURS
    ===================================================== */

    let parsedWorkingHours;

    try {
      parsedWorkingHours =
        typeof workingHours === "string"
          ? JSON.parse(workingHours)
          : workingHours;
    } catch (error) {
      await cleanupUploadedFile(req.file);

      return res.status(400).json({
        message: "Invalid working hours format"
      });
    }

    /* =====================================================
       SERVICES
    ===================================================== */

    let parsedServices = [];

    try {
      parsedServices =
        typeof services === "string"
          ? JSON.parse(services)
          : services || [];
    } catch (error) {
      await cleanupUploadedFile(req.file);

      return res.status(400).json({
        message: "Invalid services format"
      });
    }

    if (!Array.isArray(parsedServices)) {
      await cleanupUploadedFile(req.file);

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
        await cleanupUploadedFile(req.file);

        return res.status(400).json({
          message: "One or more selected services are invalid"
        });
      }
    }

    /* =====================================================
       CREATE STAFF
    ===================================================== */

    const staff = await Staff.create({
      salon: salonId,
      name,
      specialization,
      services: parsedServices,
      phone,
      profileImage,
      workingHours: parsedWorkingHours
    });

    /* =====================================================
       RESPONSE
    ===================================================== */

    res.status(201).json({
      message: "Staff created successfully",
      staff
    });
  } catch (error) {
    console.error(
      "Create staff error:",
      error
    );

    /*
      If DB creation or any later operation fails,
      remove the newly uploaded Cloudinary image.
    */
    await cleanupUploadedFile(req.file);

    res.status(500).json({
      message: "Failed to create staff",
      error: error.message
    });
  }
};

/* =========================================================
   GET ALL STAFF
========================================================= */

const getAllStaff = async (req, res) => {
  try {
    let filter = {};

    /* =====================================================
       ADMIN
    ===================================================== */

    if (req.user.role === "ADMIN") {
      filter = {};
    }

    /* =====================================================
       SALON OWNER
    ===================================================== */

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

    /* =====================================================
       FETCH STAFF
    ===================================================== */

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

/* =========================================================
   GET STAFF BY ID
========================================================= */

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

    /* =====================================================
       ADMIN
    ===================================================== */

    if (req.user.role === "ADMIN") {
      return res.status(200).json(staff);
    }

    /* =====================================================
       SALON OWNER
    ===================================================== */

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

/* =========================================================
   UPDATE STAFF
========================================================= */

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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       REQUEST DATA
    ===================================================== */

    const {
      name,
      specialization,
      phone,
      workingHours,
      services
    } = req.body;

    /* =====================================================
       BASIC FIELDS
    ===================================================== */

    staff.name =
      name ?? staff.name;

    staff.specialization =
      specialization ??
      staff.specialization;

    staff.phone =
      phone ?? staff.phone;

    /* =====================================================
       SERVICES
    ===================================================== */

    if (services !== undefined) {
      let parsedServices;

      try {
        parsedServices =
          typeof services === "string"
            ? JSON.parse(services)
            : services;
      } catch (error) {
        await cleanupUploadedFile(req.file);

        return res.status(400).json({
          message: "Invalid services format"
        });
      }

      if (!Array.isArray(parsedServices)) {
        await cleanupUploadedFile(req.file);

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

        if (
          validServices.length !==
          parsedServices.length
        ) {
          await cleanupUploadedFile(req.file);

          return res.status(400).json({
            message:
              "One or more selected services are invalid"
          });
        }
      }

      staff.services = parsedServices;
    }

    /* =====================================================
       WORKING HOURS
    ===================================================== */

    if (workingHours !== undefined) {
      try {
        staff.workingHours =
          typeof workingHours === "string"
            ? JSON.parse(workingHours)
            : workingHours;
      } catch (error) {
        await cleanupUploadedFile(req.file);

        return res.status(400).json({
          message:
            "Invalid working hours format"
        });
      }
    }

    /* =====================================================
       UPDATE PROFILE IMAGE
    ===================================================== */

    if (req.file) {
      /*
        Save old image before replacing it.
      */
      const oldImage = staff.profileImage;

      /*
        New Cloudinary HTTPS URL.
      */
      staff.profileImage = req.file.path;

      /*
        Save staff first.
      */
      await staff.save();

      /*
        Delete old Cloudinary image AFTER
        successful DB save.

        If old image is a local legacy path,
        deleteCloudinaryImage() simply ignores it.
      */
      if (oldImage) {
        await deleteCloudinaryImage(oldImage);
      }
    } else {
      await staff.save();
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

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

    /*
      If a new Cloudinary image was uploaded
      but update failed, clean it up.
    */
    await cleanupUploadedFile(req.file);

    res.status(500).json({
      message:
        "Failed to update staff",
      error: error.message
    });
  }
};

/* =========================================================
   DELETE STAFF
========================================================= */

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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       SAVE IMAGE URL
    ===================================================== */

    const staffImage =
      staff.profileImage;

    /* =====================================================
       DELETE STAFF
    ===================================================== */

    await Staff.findByIdAndDelete(
      req.params.id
    );

    /* =====================================================
       DELETE CLOUDINARY IMAGE
    ===================================================== */

    if (staffImage) {
      await deleteCloudinaryImage(
        staffImage
      );
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

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

/* =========================================================
   ACTIVATE STAFF
========================================================= */

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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       ACTIVATE
    ===================================================== */

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

/* =========================================================
   DEACTIVATE STAFF
========================================================= */

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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       DEACTIVATE
    ===================================================== */

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

/* =========================================================
   ADD STAFF LEAVE
========================================================= */

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
        message: "Invalid date"
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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       CHECK OVERLAPPING LEAVE
    ===================================================== */

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

    /* =====================================================
       ADD LEAVE
    ===================================================== */

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

/* =========================================================
   REMOVE STAFF LEAVE
========================================================= */

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

    /* =====================================================
       OWNER AUTHORIZATION
    ===================================================== */

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

    /* =====================================================
       VALIDATE INDEX
    ===================================================== */

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

    /* =====================================================
       REMOVE LEAVE
    ===================================================== */

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

/* =========================================================
   GET STAFF BY SERVICE
========================================================= */

const getStaffByService = async (
  req,
  res
) => {
  try {
    const {
      salonId,
      serviceId
    } = req.params;

    if (!salonId || !serviceId) {
      return res.status(400).json({
        message:
          "Salon ID and Service ID are required"
      });
    }

    /* =====================================================
       CHECK SALON
    ===================================================== */

    const salon =
      await Salon.findById(
        salonId
      ).select(
        "name city address isActive"
      );

    if (!salon) {
      return res.status(404).json({
        message:
          "Salon not found"
      });
    }

    if (!salon.isActive) {
      return res.status(400).json({
        message:
          "Salon is inactive"
      });
    }

    /* =====================================================
       CHECK SERVICE
    ===================================================== */

    const service =
      await Service.findOne({
        _id: serviceId,
        salon: salonId,
        isActive: true
      }).populate(
        "category",
        "name description"
      );

    if (!service) {
      return res.status(404).json({
        message:
          "Service not found in this salon"
      });
    }

    /* =====================================================
       FETCH STAFF
    ===================================================== */

    const staff =
      await Staff.find({
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

    /* =====================================================
       RESPONSE
    ===================================================== */

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
      message:
        "Failed to fetch staff for service",
      error: error.message
    });
  }
};

/* =========================================================
   GET STAFF AVAILABILITY
========================================================= */

const getStaffAvailability = async (
  req,
  res
) => {
  try {
    const {
      date
    } = req.query;

    if (!date) {
      return res.status(400).json({
        message:
          "Date is required"
      });
    }

    const selectedDate =
      new Date(date);

    if (
      isNaN(
        selectedDate.getTime()
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid date"
      });
    }

    /* =====================================================
       FETCH STAFF
    ===================================================== */

    const staff =
      await Staff.findById(
        req.params.id
      ).populate(
        "salon",
        "name city owner isActive"
      );

    if (!staff) {
      return res.status(404).json({
        message:
          "Staff not found"
      });
    }

    if (!staff.salon) {
      return res.status(400).json({
        message:
          "Staff is not associated with a salon"
      });
    }

    /* =====================================================
       CHECK SALON
    ===================================================== */

    if (!staff.salon.isActive) {
      return res.status(200).json({
        available: false,
        reason:
          "Salon is currently inactive"
      });
    }

    /* =====================================================
       CHECK STAFF
    ===================================================== */

    if (!staff.isActive) {
      return res.status(200).json({
        available: false,
        reason:
          "Staff is currently inactive"
      });
    }

    /* =====================================================
       CHECK LEAVE
    ===================================================== */

    const onLeave =
      staff.leaves.some(
        (leave) => {
          const start =
            new Date(
              leave.startDate
            );

          const end =
            new Date(
              leave.endDate
            );

          return (
            selectedDate >= start &&
            selectedDate <= end
          );
        }
      );

    if (onLeave) {
      return res.status(200).json({
        available: false,
        reason:
          "Staff is on leave"
      });
    }

    /* =====================================================
       DAY MAP
    ===================================================== */

    const dayMap = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY"
    ];

    const day =
      dayMap[
        selectedDate.getUTCDay()
      ];

    /* =====================================================
       WORKING HOUR
    ===================================================== */

    const workingHour =
      staff.workingHours.find(
        (item) =>
          item.day === day
      );

    if (!workingHour) {
      return res.status(200).json({
        available: false,
        reason:
          "Working hours not configured for this day"
      });
    }

    if (!workingHour.isWorking) {
      return res.status(200).json({
        available: false,
        reason:
          "Staff is not working on this day"
      });
    }

    /* =====================================================
       RESPONSE
    ===================================================== */

    return res.status(200).json({
      available: true,

      date,

      day,

      workingHours: {
        startTime:
          workingHour.startTime,
        endTime:
          workingHour.endTime
      },

      staff: {
        id: staff._id,
        name: staff.name,
        specialization:
          staff.specialization,
        salon: staff.salon
      }
    });
  } catch (error) {
    console.error(
      "Get staff availability error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to check staff availability",
      error: error.message
    });
  }
};

/* =========================================================
   EXPORTS
========================================================= */

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