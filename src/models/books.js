import mongoose from "mongoose";
const { Schema, model } = mongoose;

const bookSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    genre: { type: String },
    coverImage: { type: String, default: "" },
    averageRating: { type: Number, default: null },
    reviewsCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Delete associated reviews when book is deleted
bookSchema.pre('findOneAndDelete', async function() {
  const bookId = this.getQuery()._id;
  if (bookId) {
    const Review = mongoose.model('Review');
    await Review.deleteMany({ bookId: bookId });
  }
});

export default model("Book", bookSchema);
