const express = require('express');
// create a new Router object
const router = express.Router();

router.get('/', function(req,res){
    if (req.session.visitCount) {
        req.session.visitCount++;
    } else {
        req.session.visitCount = 1;
    }
    res.render('landing/index')
})

router.get('/about-us', function(req,res){
    res.render("landing/about-us")
})

router.get("/contact-us", function(req,res){
    res.render("landing/contact-us");
})

module.exports = router;