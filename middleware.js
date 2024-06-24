const Listing = require("./models/listing");
const Review = require("./models/review");



module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()) {
        ///redirect url save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error" , "You Must Be Logged In");
        return res.redirect("/login");

      }
      next();
}

module.exports.saveRedirectUrl = (req , res , next ) => {
    if(req.session.redirectUrl){
        res.locals.redirecturl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req , res , next ) => {
    let{id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.curruser._id)){
      req.flash("error","Cannot update");
      return res.redirect(`/listings/${id}`);
    }
    next();
}


module.exports.isReviewAuthor = async (req , res , next ) => {
    let{id , reviewId} = req.params;
    let listing = await Review.findById(reviewId);
    if(!review.author._id.equals(res.locals.curruser._id)){
      req.flash("error","Cannot update");
      return res.redirect(`/listings/${id}`);
    }
    next();
}