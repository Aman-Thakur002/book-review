import express from 'express';
import * as UserController from '../controller/users.controller.js';
import multer from 'multer';
import fs from 'fs';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(global.config.userUploadPath, { recursive: true });
    return cb(null, global.config.userUploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    let ext = file.originalname.substring(
      file.originalname.lastIndexOf("."),
      file.originalname.length,
    );
    cb(null, uniqueSuffix + ext);
  },
});
const upload = multer({
  storage: storage,
});

const api = express.Router();
api.post('/login', UserController.logInAdmin);
api.post('/signup', upload.single('avatar'), UserController.SignUp);
api.get('/', UserController.getUser);
api.delete('/:id', UserController.deleteUser);

export default api;
