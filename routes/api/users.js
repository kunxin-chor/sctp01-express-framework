const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, BlacklistedToken } = require('../../models');
const { checkIfAuthenticatedJWT } = require('../../middlewares');

// the user object here will be a plain JavaScript object
// (the one in the lab sheet is Bookshelf model instance)
function generateAccessToken(user, secret, expiresIn) {
    return jwt.sign({
        id: user.id
    }, secret, {
        expiresIn: expiresIn
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
        const accessToken = generateAccessToken(user.toJSON(), process.env.TOKEN_SECRET, "15m");
        const refreshToken = generateAccessToken(user.toJSON(), process.env.REFRESH_TOKEN_SECRET, "3w")
        res.json({
            accessToken, refreshToken
        });
    } else {
        res.status(401);
        res.json({
            'error':"Wrong email or password"
        })
    }
});

router.post('/logout', async function(req,res){
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
    } else {
        // verify if the refresh token is valid to begin with
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async function(err, payload){
            if (err) {
                return res.sendStatus(403);
            }

            const token = new BlacklistedToken({
                'token': refreshToken,
                'date_created': new Date()
            });
            await token.save();
            res.json({
                'message':"Logged out"
            })
        })
    }
})

router.post('/refresh', async function(req,res){
    // we check if the given refresh token is blacklisted (i.e, whether it
    // exists in the blacklisted_tokens table)
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
        return
    }

    const blacklistedToken = await BlacklistedToken.where({
        'token': refreshToken
    }).fetch({
        require: false
    })

    if (blacklistedToken) {
        res.status(401);
        return res.send({
            'message':"Cannot get new access token from refresh token"
        })
    }

    // verify whether the refresh token is valid or not
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, function(err, payload){
        if (err) {
            return res.sendStatus(403);
            
        }
        const accessToken = generateAccessToken(payload, process.env.TOKEN_SECRET, '15m');
        return res.json({
            accessToken
        })
    })
})

router.get('/profile', checkIfAuthenticatedJWT, async function(req,res){
    res.send("Able to see");
})

module.exports = router;