const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");


// ================= SIGNUP =================

module.exports.signup = (req, res) => {
    res.render("user/signup.ejs");
};


// ================= PROCESS SIGNUP =================

module.exports.psignup = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;

        const newUser = new User({
            email,
            username
        });

        const registeredUser = await User.register(newUser, password);

        req.login(registeredUser, (err) => {

            if (err) {
                return next(err);
            }

            req.flash("success", "Welcome to WanderLust");

            res.redirect("/listings");
        });

    } catch (err) {

        req.flash("error", err.message);

        res.redirect("/signup");
    }
};


// ================= LOGIN =================

module.exports.login = (req, res) => {
    res.render("user/login.ejs");
};


// ================= PROCESS LOGIN =================

module.exports.plogin = async (req, res) => {

    req.flash(
        "success",
        "Welcome You Have Been logged In"
    );

    let redirectUrl =
        res.locals.redirecturl || "/listings";

    res.redirect(redirectUrl);
};


// ================= LOGOUT =================

module.exports.logout = (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }

        req.flash(
            "success",
            "logged you out!"
        );

        res.redirect("/listings");
    });
};


// ================= PROFILE =================

module.exports.profile = async (req, res) => {

    const { id } = req.params;

    // Check whether ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash("error", "Invalid user ID");
        return res.redirect("/listings");
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
        req.flash(
            "error",
            "User does not exist"
        );

        return res.redirect("/listings");
    }


    // Find all listings owned by this user
    const listings = await Listing.find({
        owner: user._id
    }).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    });


    // ================= OVERALL REVIEWS =================

    let totalReviews = 0;
    let totalRating = 0;

    listings.forEach((listing) => {

        const reviews = listing.reviews || [];

        reviews.forEach((review) => {

            totalReviews++;

            totalRating += review.rating || 0;

        });

    });


    // Overall average rating
    const overallAverage = totalReviews
        ? (totalRating / totalReviews).toFixed(2)
        : null;


    // ================= EACH LISTING =================

    const listingData = listings.map((listing) => {

        const reviews = listing.reviews || [];

        const ratingTotal = reviews.reduce(
            (sum, review) =>
                sum + (review.rating || 0),
            0
        );

        const averageRating = reviews.length
            ? (ratingTotal / reviews.length).toFixed(1)
            : null;

        return {
            listing,
            averageRating,
            reviewCount: reviews.length
        };

    });


    // ================= RENDER =================

    res.render("user/profile.ejs", {
        user,
        listings: listingData,
        overallAverage,
        totalReviews
    });
};


// ================= EDIT PROFILE =================

module.exports.editProfile = async (req, res) => {

    const { id } = req.params;


    // Check ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {

        req.flash(
            "error",
            "Invalid user ID"
        );

        return res.redirect("/listings");
    }


    // Only profile owner can edit
    if (
        !req.user ||
        !req.user._id.equals(id)
    ) {

        req.flash(
            "error",
            "You are not allowed to edit this profile"
        );

        return res.redirect(`/users/${id}`);
    }


    // Find user
    const user = await User.findById(id);

    if (!user) {

        req.flash(
            "error",
            "User does not exist"
        );

        return res.redirect("/listings");
    }


    // Render edit page
    res.render("user/edit.ejs", {
        user
    });
};


// ================= UPDATE PROFILE =================

module.exports.updateProfile = async (req, res) => {

    const { id } = req.params;


    // Check ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {

        req.flash(
            "error",
            "Invalid user ID"
        );

        return res.redirect("/listings");
    }


    // Only profile owner can update
    if (
        !req.user ||
        !req.user._id.equals(id)
    ) {

        req.flash(
            "error",
            "You are not allowed to edit this profile"
        );

        return res.redirect(`/users/${id}`);
    }


    // Find user
    const user = await User.findById(id);

    if (!user) {

        req.flash(
            "error",
            "User does not exist"
        );

        return res.redirect("/listings");
    }


    // ================= DESCRIPTION =================

    user.description =
        req.body.description || "";


    // ================= PROFILE PHOTO =================

    console.log("Uploaded file:", req.file);

    if (req.file) {

        user.profilePhoto = {
            url: req.file.path,
            filename: req.file.filename
        };

    }


    // Save changes
    await user.save();


    req.flash(
        "success",
        "Profile updated successfully"
    );


    // Go back to profile
    res.redirect(`/users/${id}`);
};