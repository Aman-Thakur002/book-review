import Review from '../models/reviews.js';
import Book from '../models/books.js';
import mongoose from 'mongoose';

/**
 * Recalculate average rating and reviews count for a book and persist to Book document.
 * Returns the updated book document.
 */
export async function recalcBookRating(bookId) {
  if (!mongoose.Types.ObjectId.isValid(bookId)) return null;

  const agg = await Review.aggregate([
    { $match: { bookId: new mongoose.Types.ObjectId(bookId) } },
    { $group: { _id: '$bookId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avgRating = agg[0] ? Number(agg[0].avgRating.toFixed(2)) : null;
  const count = agg[0] ? agg[0].count : 0;

  const updated = await Book.findByIdAndUpdate(
    bookId,
    { averageRating: avgRating, reviewsCount: count },
    { new: true }
  );

  return updated;
}
