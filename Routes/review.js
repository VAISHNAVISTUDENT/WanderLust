const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router({ mergeParams: true });  // Ensuring the router merges params from parent routes
const ExpressError = require("../utils/ExpressError.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const listingController = require("../controllers/reviews.js");
// Middleware for validating reviews
const validateReviews = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(400, msg);
  } else {
    next();
  }
};

// Route for creating a new review
router.post("/", validateReviews,isLoggedIn, wrapAsync(listingController.newReview));

// Route for deleting a review
router.delete("/:reviewId",isReviewAuthor, wrapAsync(listingController.deleteReview));

module.exports = router;
