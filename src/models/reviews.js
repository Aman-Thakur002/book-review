import mongoose from 'mongoose';
import { recalcBookRating } from '../utility/ratings.js';
const { Schema, model } = mongoose;

const reviewSchema = new Schema(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
);

// ensure one review per user per book at DB level
reviewSchema.index({ bookId: 1, user: 1 }, { unique: true });

// ensure one review per user per book
// After creating or saving a review, recalculate the book's average
reviewSchema.post('save', async function (doc) {
  try {
    await recalcBookRating(doc.bookId);
  } catch (err) {
    console.error('Failed to recalc book rating after save:', err.message);
  }
});

// When a review is updated via findOneAndUpdate, the post hook receives the doc
reviewSchema.post('findOneAndUpdate', async function (doc) {
  try {
    if (doc) await recalcBookRating(doc.bookId);
  } catch (err) {
    console.error('Failed to recalc book rating after update:', err.message);
  }
});

// When a review is deleted via findOneAndDelete or findByIdAndDelete
reviewSchema.post('findOneAndDelete', async function (doc) {
  try {
    if (doc) await recalcBookRating(doc.bookId);
  } catch (err) {
    console.error('Failed to recalc book rating after delete:', err.message);
  }
});

export default model('Review', reviewSchema);
