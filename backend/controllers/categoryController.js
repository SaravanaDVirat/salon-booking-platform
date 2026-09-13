const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const {
      name,
      description
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required"
      });
    }
    const existingCategory = await Category.findOne({
      name: {
        $regex: `^${name.trim()}$`,
        $options: "i"
      }
    });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists"
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description
    });

    res.status(201).json({
      message: "Category created successfully",
      category
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create category"
    });
  }
};


const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isActive: true
    }).sort({
      name: 1
    });

    res.status(200).json({
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
};

const getAllCategoriesForAdmin = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({
        createdAt: -1
      });

    res.status(200).json({
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch categories"
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    res.status(200).json({
      category
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch category"
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const {
      name,
      description
    } = req.body;
    
    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {

      const existingCategory = await Category.findOne({
        name: {
          $regex: `^${name.trim()}$`,
          $options: "i"
        },

        _id: {
          $ne: req.params.id
        }
      });

      if (existingCategory) {
        return res.status(409).json({
          message: "Category name already exists"
        });
      }

      category.name = name.trim();
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update category"
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    category.isActive = false;

    await category.save();

    res.status(200).json({
      message: "Category deactivated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete category"
    });
  }
};


const activateCategory = async (req, res) => {
  try {
    const category = await Category.findById(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    category.isActive = true;

    await category.save();

    res.status(200).json({
      message: "Category activated successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to activate category"
    });
  }
};


module.exports = {
  createCategory,
  getCategories,
  getAllCategoriesForAdmin,
  getCategoryById,
  updateCategory,
  deleteCategory,
  activateCategory
};