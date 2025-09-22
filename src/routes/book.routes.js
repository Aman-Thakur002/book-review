import express from 'express';
import * as booksController from '../controller/books.controller.js';
import { ensureAuth } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(global.config.bookImageUploadPath, { recursive: true });
    return cb(null, global.config.bookImageUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = file.originalname.substring(file.originalname.lastIndexOf('.'));
  cb(null, uniqueSuffix + ext);
  },
});
const upload = multer({
  storage: storage,
});


router.post('/',ensureAuth('User'), upload.single('coverImage'), booksController.addBook);
router.get('/', ensureAuth('Guest'), booksController.getBooks);
router.get('/:id', ensureAuth('Guest'), booksController.getBookById);
router.delete('/:id', ensureAuth('User'), booksController.deleteBook);

export default router;
