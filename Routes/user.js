const express = require("express");

const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const passport = require("passport");

const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

const multer = require("multer");

const { storage } = require("../cloudConfig.js");

const upload = multer({ storage });


// ================= SIGNUP =================

router.get(
    "/signup",
    userController.signup
);

router.post(
    "/signup",
    wrapAsync(userController.psignup)
);


// ================= LOGIN =================

router.get(
    "/login",
    userController.login
);

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }),
    wrapAsync(userController.plogin)
);


// ================= LOGOUT =================

router.get(
    "/logout",
    userController.logout
);


// ================= EDIT PROFILE =================

router.get(
    "/:id/edit",
    wrapAsync(userController.editProfile)
);


// ================= UPDATE PROFILE =================

router.put(
    "/:id",
    upload.single("profilePhoto"),
    wrapAsync(userController.updateProfile)
);


// ================= PROFILE =================

router.get(
    "/:id",
    wrapAsync(userController.profile)
);


module.exports = router;