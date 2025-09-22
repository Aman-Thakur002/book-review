import Review from '../models/reviews.js';
import Book from '../models/books.js';
import mongoose from 'mongoose';

//-------<< create review >>----------------
export async function createReview(req, res,next) {
  try {
    const bookId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.sendJson(400, false, null, 'Invalid book id');
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).send({ status: 'error', message: 'Book not found' });

  const review = new Review({ bookId: bookId, user: userId, rating, comment });
  await review.save();

    return res.status(201).send({
      status: "success",
      message: "Review created successfully",
      data: review,
    });
  } catch (err) {
   next(err);
  }
}

//-------------<< update review >>----------------
export async function updateReview(req, res,next) {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).send({ status: "error", message: "Invalid review id" });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).send({ status: "error", message: "Review not found" });
    if (review.user.toString() !== userId) return res.status(403).send({ status: "error", message: "Not authorized" });

    const updated = await Review.findOneAndUpdate(
      { _id: reviewId },
      { $set: { ...(rating ? { rating } : {}), ...(typeof comment !== 'undefined' ? { comment } : {}) } },
      { new: true }
    );

    return res.status(200).send({ status: "success", message: "Review updated successfully", data: updated });
  } catch (err) {
     next(err);
  }
}

// Delete own review
export async function deleteReview(req, res,next) {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).send({ status: "error", message: "Invalid review id" });
    }

  const review = await Review.findById(reviewId);
  if (!review) return res.status(404).send({ status: "error", message: "Review not found" });
  if (review.user.toString() !== userId) return res.status(403).send({ status: "error", message: "Not authorized" });

  await Review.findOneAndDelete({ _id: reviewId });

  return res.status(200).send({ status: "success", message: "Review deleted successfully" });
  } catch (err) {
  next(err);
  }
}
