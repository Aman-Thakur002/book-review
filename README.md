# Book Review API

A comprehensive Book Review REST API built with Node.js, Express, and MongoDB. This application allows users to manage books and reviews with JWT-based authentication and role-based access control.

## 🚀 Features

- **JWT Authentication**: Secure user registration and login
- **Book Management**: Add, view, search, and delete books
- **Review System**: Users can create, update, and delete reviews (one per book)
- **Rating System**: Automatic calculation of average ratings
- **File Upload**: Support for book cover images and user avatars
- **Search & Pagination**: Advanced search with pagination support
- **Role-Based Access**: User role management with permissions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## 🛠️ Installation & Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Aman-Thakur002/book-review
cd book-review-api
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Environment Configuration
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
MONGO_URI=mongodb://localhost:27017/book-review
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/book-review?retryWrites=true&w=majority

PORT=3600
JWT_SECRET=your_super_secure_jwt_secret_key_here
```

### Step 4: Start the Application

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:3600` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:3600/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Response Format
All API responses follow this structure:
```json
{
  "status": "success|error",
  "message": "Response message",
  "data": "Response data (if applicable)",
  "total": "Total count (for paginated responses)"
}
```

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/users/signup
Content-Type: multipart/form-data

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "avatar": "file" // Optional image file
}
```

### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "accessToken": "jwt_token_here",
  "data": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "1234567890",
    "role": "User"
  }
}
```

## 📖 Book Endpoints

### Create Book (Auth Required)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Fiction",
  "coverImage": "file" // Optional image file
}
```

### Get All Books (Public)
```http
GET /api/books?page=1&limit=10&search=gatsby&order=desc&orderBy=createdAt
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search in title, author, or genre
- `order`: Sort order (asc/desc, default: desc)
- `orderBy`: Sort field (default: createdAt)
- `author`: Filter by author
- `genre`: Filter by genre

### Get Book Details (Public)
```http
GET /api/books/:id?page=1&limit=5
```

Returns book details with paginated reviews and average rating.

### Delete Book (Auth Required - Owner Only)
```http
DELETE /api/books/:id
Authorization: Bearer <token>
```

## ⭐ Review Endpoints

### Create Review (Auth Required)
```http
POST /api/books/:id/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "comment": "Excellent book!"
}
```

**Note:** Users can only create one review per book.

### Update Review (Auth Required - Owner Only)
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review (Auth Required - Owner Only)
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

## 👥 User Management Endpoints

### Get Users (Auth Required)
```http
GET /api/users?page=1&limit=10&search=john&order=desc&orderBy=createdAt
Authorization: Bearer <token>
```

### Delete User (Auth Required)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

## 📁 File Upload

The API supports file uploads for:
- **Book cover images**: Stored in `/public/images/book/`
- **User avatars**: Stored in `/public/images/user/`

Uploaded files are accessible via:
```
http://localhost:3600/public/images/book/filename.jpg
http://localhost:3600/public/images/user/filename.jpg
```

## 🧪 Testing with Postman

1. Import the provided Postman collection: `Book Review API.postman_collection.json`
2. Set up environment variables:
   - `baseUrl`: `http://localhost:3600/api`
   - `token`: Your JWT token (obtained from login)

## 📊 Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phoneNumber: String (required),
  avatar: String (optional),
  role: String (enum: ["User"], default: "User"),
  timestamps: true
}
```

### Book Model
```javascript
{
  title: String (required),
  author: String (required),
  genre: String (optional),
  coverImage: String (optional),
  averageRating: Number (calculated),
  reviewsCount: Number (calculated),
  createdBy: ObjectId (ref: User, required),
  timestamps: true
}
```

### Review Model
```javascript
{
  bookId: ObjectId (ref: Book, required),
  user: ObjectId (ref: User, required),
  rating: Number (required, 1-5),
  comment: String (optional),
  timestamps: true
}
```

## 🔧 Project Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection
│   └── flle-paths.js        # File path configurations
├── controller/
│   ├── books.controller.js  # Book-related logic
│   ├── reviews.controller.js # Review-related logic
│   └── users.controller.js  # User-related logic
├── middleware/
│   └── auth.js             # Authentication middleware
├── models/
│   ├── books.js            # Book schema
│   ├── reviews.js          # Review schema
│   └── users.js            # User schema
├── routes/
│   ├── book.routes.js      # Book routes
│   ├── index.routes.js     # Main router
│   ├── reviews.routes.js   # Review routes
│   └── users.routes.js     # User routes
├── utility/
│   ├── jwt.js              # JWT utilities
│   └── ratings.js          # Rating calculations
├── validations/
│   └── users.js            # Input validations
└── app.js                  # Main application file
```



