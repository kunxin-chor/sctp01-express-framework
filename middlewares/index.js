const { User } = require("../models");

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
module.exports = {
    checkIfAuthenticated
}