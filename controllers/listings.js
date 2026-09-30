const Listing = require("../models/listing.js");


// INDEX
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};


// NEW
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};


// CREATE
module.exports.createListing = async (req, res) => {

    const {
        latitude,
        longitude,
        ...listingData
    } = req.body.listing;

    const newListing = new Listing(listingData);

    newListing.owner = req.user._id;

    // Multiple images
    newListing.images = (req.files || []).map(file => ({
        url: file.path,
        filename: file.filename
    }));

    // Create GeoJSON Point
    newListing.geometry = {
        type: "Point",
        coordinates: [
            Number(longitude),
            Number(latitude)
        ]
    };

    await newListing.save();

    req.flash("success", "New Listing Created");

    res.redirect("/listings");
};

// SHOW
module.exports.id = async (req, res) => {

    const today = new Date().toISOString().split("T")[0];

    const { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing Does Not Exist");
        return res.redirect("/listings");
    }

    res.render("listings/show.ejs", {
        listing,
        today
    });
};


// EDIT
module.exports.edit = async (req, res) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = "";

    if (listing.images?.length > 0) {
        originalImageUrl = listing.images[0].url.replace(
            "/upload",
            "/upload/h_300,w_250"
        );
    }

    res.render("listings/edit.ejs", {
        listing,
        originalImageUrl
    });
};


// UPDATE
// UPDATE
module.exports.update = async (req, res) => {

    const { id } = req.params;

    const {
        latitude,
        longitude,
        ...listingData
    } = req.body.listing;

    const listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    // Update normal listing fields
    Object.assign(listing, listingData);

    // Update location
    listing.geometry = {
        type: "Point",
        coordinates: [
            Number(longitude),
            Number(latitude)
        ]
    };

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {

        const newImages = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));

        listing.images.push(...newImages);
    }

    await listing.save();

    req.flash("success", "Listing updated");

    res.redirect(`/listings/${id}`);
};
// DELETE
module.exports.delete = async (req, res) => {

    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
        req.flash("error", "Listing does not exist");
        return res.redirect("/listings");
    }

    req.flash("success", "Listing Deleted");

    res.redirect("/listings");
};

module.exports.search = async (req, res) => {

    const { q } = req.query;

    if (!q || !q.trim()) {
        return res.redirect("/listings");
    }

    const searchQuery = q.trim();

    const allListings = await Listing.find({
        $or: [
            {
                title: {
                    $regex: searchQuery,
                    $options: "i"
                }
            },
            {
                location: {
                    $regex: searchQuery,
                    $options: "i"
                }
            },
            {
                country: {
                    $regex: searchQuery,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: searchQuery,
                    $options: "i"
                }
            }
        ]
    });

    res.render("listings/index.ejs", {
        allListings,
        searchQuery
    });
};