// @desc    Delete all crops for a user
// @route   DELETE /api/crops
// @access  Private
export const deleteAllCrops = async (req, res) => {
  try {
    await Crop.deleteMany({ userId: req.user.id });
    res.json({ success: true, message: 'All crops deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import Crop from '../models/Crop.model.js';

// @desc    Get all crops for a user
// @route   GET /api/crops
// @access  Private
export const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Private
export const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Make sure user owns crop
    if (crop.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new crop
// @route   POST /api/crops
// @access  Private
export const createCrop = async (req, res) => {
  try {
    const cropData = {
      ...req.body,
      userId: req.user.id
    };

    const crop = await Crop.create(cropData);

    res.status(201).json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update crop
// @route   PUT /api/crops/:id
// @access  Private
export const updateCrop = async (req, res) => {
  try {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Make sure user owns crop
    if (crop.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete crop
// @route   DELETE /api/crops/:id
// @access  Private
export const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Make sure user owns crop
    if (crop.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await crop.deleteOne();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add sale to crop
// @route   POST /api/crops/:id/sales
// @access  Private
export const addSale = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }
    if (crop.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const { amount, date, description, weight, weightUnit, ratePerUnit } = req.body;
    crop.sales.push({ amount, date, description, weight, weightUnit, ratePerUnit });
    await crop.save();
    res.status(201).json({ success: true, data: crop });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
