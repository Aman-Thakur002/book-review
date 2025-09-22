import jwt from 'jsonwebtoken';
import User from '../models/users.js'; // Mongoose User model
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || 'change_this_secret';

// Parse JWT without verifying
export function parseJwt(token) {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// Function to Create Token
export async function createAccessToken(user) {
  const EXPIRE_IN = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours from now (seconds)
  const token = jwt.sign({
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    role: user.role,
    expiresIn: EXPIRE_IN,
  }, SECRET_KEY);

  try {
    await User.findByIdAndUpdate(user._id, {
      accessToken: token,
      lastLogin: new Date(),
    });
  } catch (err) {
    console.error("Error updating user login info:", err.message);
  }

  return token;
}

// Decode token and verify
export function decodeToken(token) {
  return jwt.verify(token, SECRET_KEY);
}
