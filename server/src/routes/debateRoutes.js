import express from 'express';
import { createDebate, getDebateById, getUserDebates } from '../controllers/debateController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createDebate).get(protect, getUserDebates);
router.route('/:id').get(getDebateById);

export default router;
