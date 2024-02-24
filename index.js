const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const csurf = require('csurf');
require("dotenv").config();

// import in all the dependecies for sessions
const session = require('express-session');
const flash = require('connect-flash');
// indicate that our session will use files for storage
const FileStore = require('session-file-store')(session);

// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// enable sessions
app.use(session({
  store: new FileStore(),
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: true
}))

// enable flash messaging
app.use(flash());

app.use(function(req,res,next){
  // res.locals contains all the variable
  // that hbs files have access to
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");

  next();
})

// share the user name with all hbs file
app.use(function(req,res,next){
  if (req.session.userName) {
    res.locals.userName = req.session.userName;
  }
  next();
})

// enable csurf (have to exclude Stripe)
// app.use(csurf());
const csurfInstance = csurf();
app.use(function(req,res,next){
  // exclude csurf middleware if the url is checkout/process_payment
  if (req.url == "/checkout/process_payment") {
    return next();
  }
  // if not excluded from cusrf, call the csurf middleware function
  csurfInstance(req,res,next);
})

// If a middleware function has FOUR arguments, the first one is for the error
// Write the error handler for a middleware as its next middleware
// i.e the middleware below is to handle the errors from the immediate
// previous middleware
app.use(function(err, req,res,next){
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired");
    res.redirect('back'); // same as pressing the BACK button on the browser
  } else {
    next();
  }
});

app.use(function(req,res,next){
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
})




const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary');
const cartRoutes = require('./routes/shoppingCart.js');
const checkoutRoutes = require('./routes/checkout.js');

async function main() {
    // if the requested url
    // begins with '/', send it
    // to the landingRoutes router
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
    app.use('/cart', cartRoutes);
    app.use('/checkout', checkoutRoutes);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});