const { User } = require("../models");
const jwt = require('jsonwebtoken');
const checkIfAuthenticated = async function(req,res,next) {
    if (req.session.userId) {

        if (!req.session.user) {
            const user = await User.where({
                id: req.session.userId
            }).fetch({
                required: true
            });
            const userData = user.toJSON();
            req.session.user = {
                username: userData.userName,
                email: userData.email
            }
        }
        
        next();
    } else {
        req.flash('error_messages', "You must be logged in to view this page");
        res.redirect('/users/login');
    }
}

const checkIfAuthenticatedJWT = function(req,res,next) {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, user){
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        })
    } else {
        res.sendStatus(401);
    }
}

module.exports = {
    checkIfAuthenticated, checkIfAuthenticatedJWT
}