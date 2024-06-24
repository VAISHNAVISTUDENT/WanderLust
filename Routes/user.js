const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const listingController = require("../controllers/users.js");


router.get("/signup",listingController.signup);

router.post("/signup" , wrapAsync(listingController.psignup));

router.get("/login",listingController.login);

router.post("/login" ,saveRedirectUrl,passport.authenticate('local',{failureRedirect: "/login" , failureFlash:true}), wrapAsync(listingController.plogin));

router.get("/logout" , listingController.logout);

module.exports = router;