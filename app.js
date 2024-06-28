if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
// process.env.
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const {reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const multer = require("multer");
const upload = multer({dest : 'uploads/'});
const MongoStore = require("connect-mongo");
app.engine("ejs" , ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret:process.env.SECRET_CODE,
  },
  touchAfter: 24 * 3600,

});

store.on("error",() => {
  console.log("ERROR in MONGO SESSION STORE",err)
})
const sessionOptions = {
  store,
  secret: process.env.SECRET_CODE,
  resave: false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge : 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,// prevent cross-scripting attacks
  }
}




main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}


app.use(session(sessionOptions));
app.use(flash());



//just baad kyu of session

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curruser = req.user;
  next();
})

app.get('/', (req, res) => {
  res.render("listings/home.ejs");
});

app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);

app.all("*" , (req,res ,next)=>{
  next(new ExpressError(404,"Page Not Found"));
});



app.use((err,req,res,next) => {
  let {statusCode=500 , message="something went wrong"} = err;
  // res.send(message);
  console.log(message);
  res.render("error.ejs", {err});
});

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});

