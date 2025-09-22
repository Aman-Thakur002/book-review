import express from 'express';
import * as reviewsController from '../controller/reviews.controller.js';
import { ensureAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id', ensureAuth('User'), reviewsController.createReview);
router.put('/:id', ensureAuth('User'), reviewsController.updateReview);
router.delete('/:id', ensureAuth('User'), reviewsController.deleteReview);

export default router;
