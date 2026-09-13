const User = require("../models/User");
const Salon = require("../models/Salon");
const Category = require("../models/Category");
const Service = require("../models/Service");
const Staff = require("../models/Staff");
const Appointment = require("../models/Appointment");
const Review = require("../models/Review");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");


const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Admin access only"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Admin account is inactive"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    res.status(500).json({
      message: "Server error"
    });
  }
};
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalSalonOwners,
      totalSalons,
      activeSalons,
      inactiveSalons,
      totalCategories,
      totalServices,
      totalStaff,
      totalAppointments,
      totalReviews
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "CUSTOMER"
      }),

      User.countDocuments({
        role: "SALON_OWNER"
      }),

      Salon.countDocuments(),

      Salon.countDocuments({
        isActive: true
      }),

      Salon.countDocuments({
        isActive: false
      }),

      Category.countDocuments(),

      Service.countDocuments(),

      Staff.countDocuments(),

      Appointment.countDocuments(),

      Review.countDocuments()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalSalonOwners,
        totalSalons,
        activeSalons,
        inactiveSalons,
        totalCategories,
        totalServices,
        totalStaff,
        totalAppointments,
        totalReviews
      }
    });

  } catch (error) {
    console.error(
      "Dashboard stats error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
      salons
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email, password and role are required"
      });
    }

    const allowedRoles = [
      "CUSTOMER",
      "SALON_OWNER",
      "MANAGER",
      "STAFF"
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }
    let salonIds = [];

    if (Array.isArray(salons)) {
      salonIds = salons.filter(Boolean);
    }

    if (role !== "SALON_OWNER") {
      salonIds = [];
    }
    for (const salonId of salonIds) {
      if (
        !mongoose.Types.ObjectId.isValid(
          salonId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid salon ID: ${salonId}`
        });
      }
    }
    if (salonIds.length > 0) {
      const existingSalons =
        await Salon.find({
          _id: {
            $in: salonIds
          }
        });

      if (
        existingSalons.length !==
        salonIds.length
      ) {
        return res.status(404).json({
          success: false,
          message: "One or more salons not found"
        });
      }
      for (const salon of existingSalons) {
        if (
          salon.owner &&
          !salonIds.includes(
            salon._id.toString()
          )
        ) {
          return res.status(409).json({
            success: false,
            message:
              "One or more salons are already assigned"
          });
        }
      }
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      role,
      salons: salonIds,
      isActive: true
    });

    // Sync Salon.owner
    if (
      role === "SALON_OWNER" &&
      salonIds.length > 0
    ) {
      await Salon.updateMany(
        {
          _id: {
            $in: salonIds
          }
        },
        {
          $set: {
            owner: user._id
          }
        }
      );
    }

    const createdUser =
      await User.findById(user._id)
        .select("-password")
        .populate(
          "salons",
          "name city phone email"
        );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: createdUser
    });

  } catch (error) {
    console.error(
      "Create user error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to create user",
      error: error.message
    });
  }
};
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const {
      name,
      email,
      password,
      phone,
      role,
      salons
    } = req.body;

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (email) {
      const existingUser =
        await User.findOne({
          email: email.toLowerCase(),
          _id: {
            $ne: id
          }
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already registered"
        });
      }

      user.email =
        email.toLowerCase();
    }
    if (name !== undefined) {
      user.name = name;
    }

    if (phone !== undefined) {
      user.phone = phone;
    }

    if (password) {
      user.password =
        await bcrypt.hash(
          password,
          10
        );
    }
    if (role !== undefined) {
      const allowedRoles = [
        "CUSTOMER",
        "SALON_OWNER",
        "MANAGER",
        "STAFF"
      ];

      if (
        !allowedRoles.includes(role)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid role"
        });
      }

      user.role = role;
    }

    if (salons !== undefined) {

      let newSalonIds = [];

      if (Array.isArray(salons)) {
        newSalonIds =
          salons.filter(Boolean);
      }

      if (
        user.role !== "SALON_OWNER"
      ) {
        newSalonIds = [];
      }
      for (
        const salonId of newSalonIds
      ) {
        if (
          !mongoose.Types.ObjectId.isValid(
            salonId
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              `Invalid salon ID: ${salonId}`
          });
        }
      }
      const oldSalonIds =
        (user.salons || []).map(
          (salonId) =>
            salonId.toString()
        );

      const removedSalonIds =
        oldSalonIds.filter(
          (oldSalonId) =>
            !newSalonIds.includes(
              oldSalonId
            )
        );

      if (
        removedSalonIds.length > 0
      ) {
        await Salon.updateMany(
          {
            _id: {
              $in: removedSalonIds
            },
            owner: user._id
          },
          {
            $unset: {
              owner: ""
            }
          }
        );
      }
      if (
        newSalonIds.length > 0
      ) {
        const newSalons =
          await Salon.find({
            _id: {
              $in: newSalonIds
            }
          });

        if (
          newSalons.length !==
          newSalonIds.length
        ) {
          return res.status(404).json({
            success: false,
            message:
              "One or more salons not found"
          });
        }
        for (
          const salon of newSalons
        ) {
          if (
            salon.owner &&
            salon.owner.toString() !==
              user._id.toString()
          ) {
            return res.status(409).json({
              success: false,
              message:
                `Salon "${salon.name}" is already assigned to another owner`
            });
          }
        }
        await Salon.updateMany(
          {
            _id: {
              $in: newSalonIds
            }
          },
          {
            $set: {
              owner: user._id
            }
          }
        );
      }

      user.salons =
        newSalonIds;
    }

    if (
      role !== undefined &&
      role !== "SALON_OWNER"
    ) {
      if (
        user.salons &&
        user.salons.length > 0
      ) {
        await Salon.updateMany(
          {
            _id: {
              $in: user.salons
            },
            owner: user._id
          },
          {
            $unset: {
              owner: ""
            }
          }
        );
      }

      user.salons = [];
    }

    await user.save();

    const updatedUser =
      await User.findById(
        user._id
      )
        .select("-password")
        .populate(
          "salons",
          "name city phone email"
        );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(
      "Update user error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update user",
      error: error.message
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    if (
      req.user.userId.toString() ===
      id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own account"
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    if (
      user.role === "SALON_OWNER"
    ) {
      await Salon.updateMany(
        {
          owner: user._id
        },
        {
          $unset: {
            owner: ""
          }
        }
      );
    }

    await User.findByIdAndDelete(
      id
    );

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error(
      "Delete user error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users =
      await User.find()
        .select("-password")
        .populate(
          "salons",
          "name city phone email isActive"
        );

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};
const getUsersByRole = async (
  req,
  res
) => {
  try {
    const { role } =
      req.params;

    const allowedRoles = [
      "CUSTOMER",
      "SALON_OWNER",
      "MANAGER",
      "STAFF",
      "ADMIN"
    ];

    if (
      !allowedRoles.includes(role)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid role"
      });
    }

    const users =
      await User.find({
        role
      })
        .select("-password")
        .populate(
          "salons",
          "name city phone email isActive"
        );

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error(
      "Get users by role error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message
    });
  }
};

const activateUser = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          isActive: true
        },
        {
          new: true
        }
      )
        .select("-password")
        .populate(
          "salons",
          "name city phone email isActive"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "User activated successfully",
      user
    });

  } catch (error) {
    console.error(
      "Activate user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to activate user",
      error: error.message
    });
  }
};

const deactivateUser = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const user =
      await User.findByIdAndUpdate(
        id,
        {
          isActive: false
        },
        {
          new: true
        }
      )
        .select("-password")
        .populate(
          "salons",
          "name city phone email isActive"
        );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message:
        "User deactivated successfully",
      user
    });

  } catch (error) {
    console.error(
      "Deactivate user error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to deactivate user",
      error: error.message
    });
  }
};


const getAllSalons = async (
  req,
  res
) => {
  try {
    const salons =
      await Salon.find()
        .populate(
          "owner",
          "name email phone"
        );

    res.status(200).json({
      success: true,
      count: salons.length,
      salons
    });

  } catch (error) {
    console.error(
      "Get all salons error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch salons",
      error: error.message
    });
  }
};

const activateSalon = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const salon =
      await Salon.findByIdAndUpdate(
        id,
        {
          isActive: true
        },
        {
          new: true
        }
      );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found"
      });
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
        "Salon activated successfully",
      salon: updatedSalon
    });

  } catch (error) {
    console.error(
      "Activate salon error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to activate salon",
      error: error.message
    });
  }
};


const deactivateSalon = async (
  req,
  res
) => {
  try {
    const { id } =
      req.params;

    const salon =
      await Salon.findByIdAndUpdate(
        id,
        {
          isActive: false
        },
        {
          new: true
        }
      );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found"
      });
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
        "Salon deactivated successfully",
      salon: updatedSalon
    });

  } catch (error) {
    console.error(
      "Deactivate salon error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to deactivate salon",
      error: error.message
    });
  }
};


const getSalonByAdmin = async (
  req,
  res
) => {
  try {
    const salon =
      await Salon.findById(
        req.params.id
      ).populate(
        "owner",
        "name email phone"
      );

    if (!salon) {
      return res.status(404).json({
        success: false,
        message: "Salon not found"
      });
    }

    res.status(200).json({
      success: true,
      salon
    });

  } catch (error) {
    console.error(
      "Get salon by admin error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch salon"
    });
  }
};
const getAllAppointments = async (
  req,
  res
) => {
  try {
    const appointments =
      await Appointment.find()
        .populate(
          "customer",
          "name email phone"
        )
        .populate(
          "salon",
          "name city"
        )
        .populate(
          "service",
          "name price duration"
        )
        .populate(
          "staff",
          "name specialization"
        );

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    console.error(
      "Get all appointments error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch appointments",
      error: error.message
    });
  }
};

const getAllReviews = async (
  req,
  res
) => {
  try {
    const reviews =
      await Review.find()
        .populate(
          "customer",
          "name email"
        )
        .populate(
          "salon",
          "name"
        )
        .populate(
          "appointment"
        );

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error(
      "Get all reviews error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch reviews",
      error: error.message
    });
  }
};


const getAllServicesAdmin = async (req, res) => {
  try {
    const {
      salon,
      category,
      status,
      search,
    } = req.query;

    const filter = {};

    if (salon) {
      filter.salon = salon;
    }

    if (category) {
      filter.category = category;
    }

    if (status) {
      const normalizedStatus = status.toUpperCase();

      if (normalizedStatus === "ACTIVE") {
        filter.isActive = true;
      } else if (normalizedStatus === "INACTIVE") {
        filter.isActive = false;
      }
    }

    if (search && search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const services = await Service.find(filter)
      .populate(
        "salon",
        "name phone email address images isActive"
      )
      .populate(
        "category",
        "name description isActive"
      )
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(
      "Get all admin services error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch services",
    });
  }
};
module.exports = {
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
  adminLogin,
  createUser,
  updateUser,
  deleteUser,
  getSalonByAdmin,
  getAllServicesAdmin
};