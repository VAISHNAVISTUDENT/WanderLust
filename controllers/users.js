const express = require("express");
const router = express.Router();
const User = require("../models/user.js")
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

module.exports.signup = (req,res) => {
    res.render("user/signup.ejs");
}

module.exports.psignup = async(req,res,next) => {
    try{
        let {username,email,password} = req.body;
        const newUser = new User({email,username});
        const registeredUser = await User.register(newUser,password);
        
        req.login(registeredUser, (err)=> {
            if(err){
                next(err);
            }
            req.flash("success" , "Welcome to WanderLust");
            res.redirect("/listings");
        })
        
    }catch(err){
        req.flash("error",err.message)
        res.redirect("/signup");
    }
    
}

module.exports.login = (req,res) => {
    res.render("user/login.ejs")
}

module.exports.plogin = async(req,res) => {
    //in npm passport
    req.flash("success","Welcome You Have Been logged In");
    let redirectUrl = res.locals.redirecturl || "/listings";
    res.redirect(redirectUrl);
    
}

module.exports.logout = (req,res) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success" , "logged you out!");
        res.redirect("/listings");
    });
}