import Book from '../models/books.js';
import Review from '../models/reviews.js';
import mongoose from 'mongoose';

//----------<< add book >>----------------
export async function addBook(req, res,next) {
  try {
    if(req.file){
        req.body.coverImage = global.config.bookImagePath + req.file.filename;
    }
 
  // set creator from authenticated user
  if (req.user && req.user.id) req.body.createdBy = req.user.id;

  const book = new Book(req.body);
  await book.save();
  res.status(201).send({
    status: "success",
    message: "Book created successfully",
    data: book,
  });
  } catch (err) {
 next(err);
  }
};

//----------<< get books >>----------------
export async function getBooks(req, res, next) {
  const {
    search = "",
    limit = 10,
    page = 1,
    order = "desc",
    orderBy = "createdAt",
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { genre: { $regex: search, $options: "i" } },
    ];
  }

  // Optional explicit filters
  if (req.query.author) query.author = { $regex: req.query.author, $options: "i" };
  if (req.query.genre) query.genre = { $regex: req.query.genre, $options: "i" };

  const sortOrder = order === "asc" ? 1 : -1;

  try {
    const books = await Book.find(query)
      .populate("createdBy", "name email phoneNumber")
      .sort({ [orderBy]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(Number(limit));

    const total = await Book.countDocuments(query);

    res.status(200).send({ status: "success", total, data: books });
  } catch (err) {
    next(err);
  }
}

//----------<< get book by id >>----------------
export async function getBookById(req, res,next) {
  const { id } = req.params;
  const { page = 1, limit = 5 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send({ status: "error", message: "Invalid book id" });

  try {
    const book = await Book.findById(id)
    if (!book) return res.status(404).send({ status: "error", message: "Book not found" });

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ bookId: id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalReviews = await Review.countDocuments({ bookId: id });

    const agg = await Review.aggregate([
      { $match: { bookId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: '$bookId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const avgRating = agg[0] ? Number(agg[0].avgRating.toFixed(2)) : null;

    const data = {
      book,
      averageRating: avgRating,
      totalReviews: totalReviews,
      reviews: reviews,
    };

    return res.status(200).send({
      status: "success",
      message: "Book details fetched successfully",
      data: data,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
}

//----------<< delete book >>----------------
export async function deleteBook(req, res,next) {
  try {
    const bookId = req.params.id;
    const book = await Book.findOne({ _id: bookId, createdBy: req.user.id });

    if (!book) {
      return res.status(404).send({
        status: "error", 
        message: "Book not found or you don't have permission to delete it",
      });
    }

    await Book.findByIdAndDelete(bookId);
    
    return res.status(200).send({
      status: "success",
      message: "Book deleted successfully",
    });
  } catch (err) {
    next(err);
  }
}
