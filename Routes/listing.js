const express = require("express");

const router = express.Router();

const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner } = require("../middleware.js");
const { listingSchema } = require("../schema.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);

    if (error) {
        console.log("error is here");
        throw new ExpressError(400, error);
    } else {
        next();
    }
};


// New Route
router.get(
    "/new",
    isLoggedIn,
    listingController.renderNewForm
);


// Search Route
// IMPORTANT: Keep this before /:id
router.get(
    "/search",
    wrapAsync(listingController.search)
);


// Edit Route
router.get(
    "/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.edit)
);


// Listing index + create
router
    .route("/")
    .get(
        wrapAsync(listingController.index)
    )
    .post(
        isLoggedIn,
        upload.array("listing[images]", 5),
        validateListing,
        wrapAsync(listingController.createListing)
    );


// Individual listing
router
    .route("/:id")
    .get(
        wrapAsync(listingController.id)
    )
    .put(
        isLoggedIn,
        isOwner,
        upload.array("listing[images]", 5),
        validateListing,
        wrapAsync(listingController.update)
    )
    .delete(
        isLoggedIn,
        isOwner,
        wrapAsync(listingController.delete)
    );


module.exports = router;