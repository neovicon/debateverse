import express from 'express';
import { createDebate, getDebateById } from '../controllers/debateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createDebate);
router.route('/:id').get(protect, getDebateById);

export default router;
