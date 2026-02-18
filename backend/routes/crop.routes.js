import express from 'express';
import {
  getCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
  deleteAllCrops
} from '../controllers/crop.controller.js';
import { addSale } from '../controllers/crop.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCrops)
  .post(createCrop)
  .delete(deleteAllCrops);

router.route('/:id')
  .get(getCropById)
  .put(updateCrop)
  .delete(deleteCrop);

router.post('/:id/sales', addSale);

export default router;
