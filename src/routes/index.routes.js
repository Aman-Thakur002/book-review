import express from 'express';
import usersRoutes from './users.routes.js';
import booksRoutes from './book.routes.js';
import reviewsRoutes from './reviews.routes.js';
import * as booksController from '../controller/books.controller.js';
import { ensureAuth } from '../middleware/auth.js';

const api = express.Router();

api.use('/users', usersRoutes);
api.use('/books', booksRoutes);
api.use('/reviews', reviewsRoutes);

export default api;
