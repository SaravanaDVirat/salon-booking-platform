const Salon = require("../models/Salon");
const Service = require("../models/Service");
const Staff = require("../models/Staff");
const Appointment = require("../models/Appointment");
const User = require("../models/User");

const cloudinary = require("cloudinary").v2;

const parseJSON = (value, fallback = undefined) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

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

    // Remove version part: v123456789/
    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    // Remove file extension
    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    return publicId || null;
  } catch (error) {
    console.error(
      "Failed to extract Cloudinary public ID:",
      error.message
    );

    return null;
  }
};

// =====================================================
// DELETE CLOUDINARY IMAGE
// =====================================================
const deleteCloudinaryImage = async (imageUrl) => {
  const publicId =
    getCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image"
      }
    );

    console.log(
      `Cloudinary image deleted: ${publicId}`
    );
  } catch (error) {
    console.error(
      "Failed to delete Cloudinary image:",
      error.message
    );
  }
};

// =====================================================
// DELETE MULTIPLE CLOUDINARY IMAGES
// =====================================================
const deleteCloudinaryImages = async (
  images = []
) => {
  if (!Array.isArray(images) || images.length === 0) {
    return;
  }

  await Promise.all(
    images.map((image) =>
      deleteCloudinaryImage(image)
    )
  );
};

// =====================================================
// CLEANUP NEWLY UPLOADED CLOUDINARY FILES
// =====================================================
const cleanupUploadedFiles = async (
  files = []
) => {
  if (!Array.isArray(files) || files.length === 0) {
    return;
  }

  await Promise.all(
    files.map(async (file) => {
      try {
        if (file.public_id) {
          await cloudinary.uploader.destroy(
            file.public_id,
            {
              resource_type: "image"
            }
          );
        }
      } catch (error) {
        console.error(
          "Failed to cleanup uploaded Cloudinary image:",
          error.message
        );
      }
    })
  );
};

// =====================================================
// OWNER DASHBOARD
// =====================================================
const getOwnerDashboard = async (req, res) => {
  try {
    const ownerId = req.user.userId;

    const salons = await Salon.find({
      owner: ownerId
    }).sort({
      createdAt: -1
    });

    const salonIds = salons.map(
      (salon) => salon._id
    );

    if (salonIds.length === 0) {
      return res.status(200).json({
        stats: {
          totalSalons: 0,
          activeSalons: 0,
          totalServices: 0,
          totalStaff: 0,
          totalAppointments: 0,
          pendingAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0
        },

        salons: [],

        upcomingAppointments: []
      });
    }

    const [
      totalServices,
      totalStaff,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments
    ] = await Promise.all([
      Service.countDocuments({
        salon: {
          $in: salonIds
        }
      }),

      Staff.countDocuments({
        salon: {
          $in: salonIds
        }
      }),

      Appointment.countDocuments({
        salon: {
          $in: salonIds
        }
      }),

      Appointment.countDocuments({
        salon: {
          $in: salonIds
        },
        status: "PENDING"
      }),

      Appointment.countDocuments({
        salon: {
          $in: salonIds
        },
        status: "CONFIRMED"
      }),

      Appointment.countDocuments({
        salon: {
          $in: salonIds
        },
        status: "COMPLETED"
      })
    ]);

    const upcomingAppointments =
      await Appointment.find({
        salon: {
          $in: salonIds
        },

        appointmentDate: {
          $gte: new Date()
        },

        status: {
          $in: [
            "PENDING",
            "CONFIRMED"
          ]
        }
      })
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "service",
          "name price duration"
        )
        .populate(
          "staff",
          "name specialization"
        )
        .populate(
          "salon",
          "name city"
        )
        .sort({
          appointmentDate: 1
        })
        .limit(6);

    res.status(200).json({
      stats: {
        totalSalons: salons.length,

        activeSalons: salons.filter(
          (salon) => salon.isActive
        ).length,

        totalServices,
        totalStaff,
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments
      },

      salons,

      upcomingAppointments
    });
  } catch (error) {
    console.error(
      "Owner dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch owner dashboard"
    });
  }
};

// =====================================================
// CREATE SALON
// =====================================================
const createSalon = async (req, res) => {
  try {
    const {
      name,
      description,
      phone,
      email,
      address,
      city,
      location,
      workingHours,
      owner
    } = req.body;

    if (!name || !address || !city) {
      return res.status(400).json({
        message:
          "Name, address and city are required"
      });
    }

    let ownerId;

    if (req.user.role === "ADMIN") {
      ownerId = owner;
    } else {
      ownerId = req.user.userId;
    }

    if (!ownerId) {
      return res.status(400).json({
        message:
          "Salon owner is required"
      });
    }

    const ownerUser =
      await User.findById(ownerId);

    if (!ownerUser) {
      return res.status(404).json({
        message:
          "Salon owner not found"
      });
    }

    if (ownerUser.role !== "SALON_OWNER") {
      return res.status(400).json({
        message:
          "Selected user is not a salon owner"
      });
    }

    const parsedLocation =
      parseJSON(
        location,
        undefined
      );

    const parsedWorkingHours =
      parseJSON(
        workingHours,
        []
      );

    // =================================================
    // CLOUDINARY IMAGE URLS
    // =================================================
    const images =
      (req.files || []).map(
        (file) => file.path
      );

    const salon =
      await Salon.create({
        name: name.trim(),

        description,

        owner: ownerUser._id,

        phone,

        email,

        address: address.trim(),

        city: city.trim(),

        location: parsedLocation,

        images,

        workingHours:
          parsedWorkingHours
      });

    await User.findByIdAndUpdate(
      ownerUser._id,
      {
        $addToSet: {
          salons: salon._id
        }
      },
      {
        new: true
      }
    );

    const populatedSalon =
      await Salon.findById(
        salon._id
      ).populate(
        "owner",
        "name email phone"
      );

    res.status(201).json({
      success: true,

      message:
        "Salon created successfully",

      salon:
        populatedSalon
    });
  } catch (error) {
    console.error(
      "Create salon error:",
      error
    );

    // Cleanup Cloudinary uploads if DB creation fails
    await cleanupUploadedFiles(
      req.files || []
    );

    res.status(500).json({
      message:
        "Failed to create salon"
    });
  }
};

// =====================================================
// GET ALL SALONS
// =====================================================
const getAllSalons = async (req, res) => {
  try {
    const {
      search,
      city,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {
      isActive: true
    };

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (city) {
      filter.city = {
        $regex: `^${city}$`,
        $options: "i"
      };
    }

    const skip =
      (Number(page) - 1) *
      Number(limit);

    const salons =
      await Salon.find(filter)
        .populate(
          "owner",
          "name email"
        )
        .sort({
          createdAt: -1
        })
        .skip(skip)
        .limit(
          Number(limit)
        );

    const total =
      await Salon.countDocuments(
        filter
      );

    res.status(200).json({
      total,

      page:
        Number(page),

      limit:
        Number(limit),

      totalPages:
        Math.ceil(
          total /
          Number(limit)
        ),

      salons
    });
  } catch (error) {
    console.error(
      "Get all salons error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch salons"
    });
  }
};

// =====================================================
// GET SALON BY ID
// =====================================================
const getSalonById = async (req, res) => {
  try {
    const salon =
      await Salon.findOne({
        _id: req.params.id,

        isActive: true
      }).populate(
        "owner",
        "name email"
      );

    if (!salon) {
      return res.status(404).json({
        message:
          "Salon not found"
      });
    }

    res.status(200).json({
      salon
    });
  } catch (error) {
    console.error(
      "Get salon by id error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch salon"
    });
  }
};

// =====================================================
// GET MY SALONS
// =====================================================
const getMySalons = async (req, res) => {
  try {
    const salons =
      await Salon.find({
        owner:
          req.user.userId
      }).sort({
        createdAt: -1
      });

    res.status(200).json({
      count:
        salons.length,

      salons
    });
  } catch (error) {
    console.error(
      "Get my salons error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch your salons"
    });
  }
};

// =====================================================
// UPDATE SALON
// =====================================================
const updateSalon = async (req, res) => {
  try {
    const salon =
      await Salon.findById(
        req.params.id
      );

    if (!salon) {
      return res.status(404).json({
        message:
          "Salon not found"
      });
    }

    const isOwner =
      salon.owner.toString() ===
      req.user.userId;

    const isAdmin =
      req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You are not authorized to update this salon"
      });
    }

    const {
      name,
      description,
      phone,
      email,
      address,
      city,
      location,
      workingHours
    } = req.body;

    if (name !== undefined) {
      salon.name = name;
    }

    if (description !== undefined) {
      salon.description =
        description;
    }

    if (phone !== undefined) {
      salon.phone = phone;
    }

    if (email !== undefined) {
      salon.email = email;
    }

    if (address !== undefined) {
      salon.address =
        address;
    }

    if (city !== undefined) {
      salon.city =
        city;
    }

    if (location !== undefined) {
      const parsedLocation =
        parseJSON(
          location,
          location
        );

      salon.location =
        parsedLocation;
    }

    if (workingHours !== undefined) {
      const parsedWorkingHours =
        parseJSON(
          workingHours,
          workingHours
        );

      salon.workingHours =
        parsedWorkingHours;
    }

    // =================================================
    // REPLACE SALON IMAGES
    // =================================================
    if (
      req.files &&
      req.files.length > 0
    ) {
      const oldImages =
        salon.images || [];

      // New Cloudinary URLs
      const newImages =
        req.files.map(
          (file) => file.path
        );

      // Save new images first
      salon.images =
        newImages;

      await salon.save();

      // Delete old Cloudinary images
      await deleteCloudinaryImages(
        oldImages
      );
    } else {
      await salon.save();
    }

    const updatedSalon =
      await Salon.findById(
        salon._id
      ).populate(
        "owner",
        "name email phone"
      );

    res.status(200).json({
      success: true,

      message:
        "Salon updated successfully",

      salon:
        updatedSalon
    });
  } catch (error) {
    console.error(
      "Update salon error:",
      error
    );

    // Cleanup newly uploaded Cloudinary images
    await cleanupUploadedFiles(
      req.files || []
    );

    res.status(500).json({
      message:
        "Failed to update salon"
    });
  }
};

// =====================================================
// DELETE SALON
// =====================================================
const deleteSalon = async (req, res) => {
  try {
    const salon =
      await Salon.findById(
        req.params.id
      );

    if (!salon) {
      return res.status(404).json({
        message:
          "Salon not found"
      });
    }

    const isOwner =
      salon.owner.toString() ===
      req.user.userId;

    const isAdmin =
      req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You are not authorized to delete this salon"
      });
    }

    const salonImages =
      salon.images || [];

    await Salon.findByIdAndDelete(
      salon._id
    );

    if (salon.owner) {
      await User.findByIdAndUpdate(
        salon.owner,
        {
          $pull: {
            salons: salon._id
          }
        }
      );
    }

    // Delete Cloudinary images after DB deletion
    await deleteCloudinaryImages(
      salonImages
    );

    res.status(200).json({
      success: true,

      message:
        "Salon deleted successfully"
    });
  } catch (error) {
    console.error(
      "Delete salon error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to delete salon"
    });
  }
};

// =====================================================
// UPDATE SALON STATUS
// =====================================================
const updateSalonStatus = async (
  req,
  res
) => {
  try {
    const salon =
      await Salon.findById(
        req.params.id
      );

    if (!salon) {
      return res.status(404).json({
        message:
          "Salon not found"
      });
    }

    const isOwner =
      salon.owner.toString() ===
      req.user.userId;

    const isAdmin =
      req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message:
          "You are not authorized"
      });
    }

    salon.isActive =
      req.body.isActive;

    await salon.save();

    const updatedSalon =
      await Salon.findById(
        salon._id
      ).populate(
        "owner",
        "name email phone"
      );

    res.status(200).json({
      success: true,

      message:
        updatedSalon.isActive
          ? "Salon activated successfully"
          : "Salon deactivated successfully",

      salon:
        updatedSalon
    });
  } catch (error) {
    console.error(
      "Update salon status error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update salon status"
    });
  }
};

module.exports = {
  createSalon,
  getAllSalons,
  getSalonById,
  getMySalons,
  updateSalon,
  deleteSalon,
  updateSalonStatus,
  getOwnerDashboard
};