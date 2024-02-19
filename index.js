const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
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
  secret: "keyboard cat",
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

const landingRoutes = require('./routes/landing.js');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');

async function main() {
    // if the requested url
    // begins with '/', send it
    // to the landingRoutes router
    app.use('/', landingRoutes);
    app.use('/products', productRoutes);
    app.use('/users', userRoutes);

}

main();

app.listen(3000, () => {
  console.log("Server has started");
});