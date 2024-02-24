const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

// the user object here will be a plain JavaScript object
// (the one in the lab sheet is Bookshelf model instance)
function generateAccessToken(user) {
    return jwt.sign({
        id: user.id
    }, process.env.TOKEN_SECRET, {
        expiresIn: "1h"
    })
}


router.post('/login', async function(req,res){
    // find the user based on their email address
    const user = await User.where({
        email: req.body.email
    }).fetch({
        require:false
    })

    if (user && await bcrypt.compare(req.body.password, user.get('password'))) {
        const token = generateAccessToken(user.toJSON());
        res.json({
            token
        });
    } else {
        res.status(401);
        res.json({
            'error':"Wrong email or password"
        })
    }
});

router.get('/profile', checkIfAuthenticatedJWT, async function(req,res){
    res.send("Able to see");
})

module.exports = router;