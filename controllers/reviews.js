const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js"); // Import Review model
const {isLoggedIn, isOwner} = require("../middleware.js")
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const validateListing = (req,res,next) => {
    let{error} = listingSchema.validate(req.body);
    if (error){
      throw new ExpressError(400,result.error);
    }else {
      next();
    }
}
module.exports.newReview = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Added");
    res.redirect(`/listings/${listing._id}`);
  }



module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success"," Review Deleted");
    res.redirect(`/listings/${id}`);
  }

