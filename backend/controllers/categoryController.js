const categoryModel = require('../models/categoryModel');
const courseModel = require('../models/courseModel');

// Create a new category (Admin or Instructor)
exports.createCategory = async (req, res) => {
    try {
        const { name, description = '' } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const existing = await categoryModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = await categoryModel.create({
            name: name.trim(),
            description
        });

        return res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while creating category: ${error.message}`
        });
    }
};

// Fetch all categories (public)
exports.getAllCategories = async (_req, res) => {
    try {
        const categories = await categoryModel
            .find({}, 'name description courses')
            .sort({ name: 1 })
            .lean();

        const data = categories.map((cat) => ({
            _id: cat._id,
            name: cat.name,
            description: cat.description,
            coursesCount: Array.isArray(cat.courses) ? cat.courses.length : 0
        }));

        return res.status(200).json({
            success: true,
            categories: data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching categories: ${error.message}`
        });
    }
};

// Fetch courses for a given category
exports.getCategoryCourses = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Category id is required'
            });
        }

        const category = await categoryModel.findById(categoryId).lean();
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        const courses = await courseModel
            .find({ category: categoryId, status: 'Published' })
            .select('title desc thumbnail price language section ratingAndReviews status')
            .populate('instructor', 'fName lName profileImage')
            .populate({ path: 'ratingAndReviews', select: 'rating' })
            .lean();

        return res.status(200).json({
            success: true,
            category: {
                _id: category._id,
                name: category.name,
                description: category.description
            },
            courses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Error while fetching category courses: ${error.message}`
        });
    }
};
