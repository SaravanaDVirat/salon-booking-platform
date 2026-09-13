const Service = require("../models/Service");
const Salon = require("../models/Salon");
const Category = require("../models/Category");


const createService = async (req, res) => {
  try {
    const {
      salon,
      category,
      name,
      description,
      price,
      duration
    } = req.body;

    if (
      !salon ||
      !category ||
      !name ||
      price === undefined ||
      duration === undefined
    ) {
      return res.status(400).json({
        message: "Salon, category, name, price and duration are required"
      });
    }

    const salonData = await Salon.findById(salon);

    if (!salonData) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      salonData.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to manage this salon"
      });
    }

    if (!salonData.isActive) {
      return res.status(400).json({
        message: "Salon is inactive"
      });
    }

    const categoryData = await Category.findOne({
      _id: category,
      isActive: true
    });

    if (!categoryData) {
      return res.status(400).json({
        message: "Category not found or inactive"
      });
    }

    const existingService = await Service.findOne({
      salon,
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i"
      }
    });

    if (existingService) {
      return res.status(409).json({
        message: "Service already exists in this salon"
      });
    }

    const service = await Service.create({
      salon,
      category,
      name: name.trim(),
      description,
      price,
      duration
    });

    res.status(201).json({
      message: "Service created successfully",
      service
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create service"
    });
  }
};


const getSalonServices = async (req, res) => {
  try {
    const services = await Service.find({
      salon: req.params.salonId,
      isActive: true
    })
      .populate("category", "name description")
      .sort({ name: 1 });

    res.status(200).json({
      count: services.length,
      services
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch services"
    });
  }
};


const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true
    })
      .populate("category", "name description")
      .populate("salon", "name city address");

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.status(200).json({
      service
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch service"
    });
  }
};

const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }
    const salon = await Salon.findById(service.salon);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }
    if (
      req.user.role !== "ADMIN" &&
      salon.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to update this service"
      });
    }

    const {
      category,
      name,
      description,
      price,
      duration
    } = req.body;

    if (category) {
      const categoryData = await Category.findOne({
        _id: category,
        isActive: true
      });

      if (!categoryData) {
        return res.status(400).json({
          message: "Category not found or inactive"
        });
      }

      service.category = category;
    }

    if (name) {
      service.name = name.trim();
    }

    if (description !== undefined) {
      service.description = description;
    }
    if (price !== undefined) {
      service.price = price;
    }
    if (duration !== undefined) {
      service.duration = duration;
    }

    await service.save();

    res.status(200).json({
      message: "Service updated successfully",
      service
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update service"
    });
  }
};


const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    const salon = await Salon.findById(service.salon);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }
    if (
      req.user.role !== "ADMIN" &&
      salon.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to delete this service"
      });
    }

    service.isActive = false;

    await service.save();

    res.status(200).json({
      message: "Service deactivated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to deactivate service"
    });
  }
};


const activateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    const salon = await Salon.findById(service.salon);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      salon.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to activate this service"
      });
    }

    service.isActive = true;

    await service.save();

    res.status(200).json({
      message: "Service activated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to activate service"
    });
  }
};

const getSalonServicesForManagement = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.salonId);

    if (!salon) {
      return res.status(404).json({
        message: "Salon not found"
      });
    }

    if (
      req.user.role !== "ADMIN" &&
      salon.owner.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not authorized to manage this salon"
      });
    }

    const services = await Service.find({
      salon: req.params.salonId
    })
      .populate("category", "name description")
      .sort({ name: 1 });

    const activeServices = services.filter(
      (service) => service.isActive
    );

    const inactiveServices = services.filter(
      (service) => !service.isActive
    );

    res.status(200).json({
      count: services.length,
      activeCount: activeServices.length,
      inactiveCount: inactiveServices.length,
      services
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch salon services"
    });
  }
};


module.exports = {
  createService,
  getSalonServices,
  getServiceById,
  updateService,
  deleteService,
  activateService,
  getSalonServicesForManagement
};