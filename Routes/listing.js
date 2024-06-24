const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

const {isLoggedIn, isOwner} = require("../middleware.js")
const {listingSchema} = require("../schema.js");
const Listing = require("../models/listing.js");
const listingController = require("../controllers/listings.js");
const validateListing = (req,res,next) => {
  let{error} = listingSchema.validate(req.body);
  if (error){
    console.log("error is here");
    throw new ExpressError(400,error);
  }else {
    next();
  }
}
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);

//Edit Route
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.edit));


router
  .route("/")
  .get( wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingController.createListing));


router
    .route("/:id")
    .get( wrapAsync(listingController.id))
    .put(isLoggedIn,upload.single("listing[image]"), validateListing,wrapAsync( listingController.update))
    .delete(isLoggedIn,isOwner, wrapAsync(listingController.delete));
module.exports = router;