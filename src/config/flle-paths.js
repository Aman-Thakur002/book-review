import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const userUploadPath = path.resolve(__dirname, '../../public/images/user');
const userPicturePath = '/public/images/user/';
const bookImageUploadPath = path.resolve(__dirname, '../../public/images/book');
const bookImagePath = '/public/images/book/';

export default { userUploadPath, userPicturePath, bookImageUploadPath, bookImagePath };