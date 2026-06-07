import express from 'express';
import {
  getPersonas,
  createPersona,
  getPersonaById,
  deletePersona,
  updatePersona,
} from '../controllers/personaController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.route('/').get(protect, getPersonas).post(protect, upload.single('avatar'), createPersona);
router
  .route('/:id')
  .get(protect, getPersonaById)
  .put(protect, upload.single('avatar'), updatePersona)
  .delete(protect, deletePersona);

export default router;
