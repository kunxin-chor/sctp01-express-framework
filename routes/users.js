const express = require('express');
const bcrypt = require('bcrypt');

const { createRegistrationForm, bootstrapField, createLoginForm } = require('../forms');
const { User } = require('../models');
const { checkIfAuthenticated } = require('../middlewares');
const router = express.Router();

router.get('/signup', function(req,res){
    const form = createRegistrationForm();
    res.render('users/signup', {
        form: form.toHTML(bootstrapField)
    })
})

router.post('/signup',  function(req,res){
    const form = createRegistrationForm();
    form.handle(req,{
        'success':async function(form) {
            const user = new User({
                password: await bcrypt.hash(form.data.password, 10),
                email: form.data.email,
                username: form.data.username         
            });
            await user.save();
            req.flash("Your account has been created, please login!");
            res.redirect('/users/login')
        },
        'empty': function(form) {
            res.render('users/signup',{
                form: form.toHTML(bootstrapField)
            })
        },
        'error': function(form) {
            res.render('users/signup',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/login', function(req,res){
    const form = createLoginForm();
    res.render('users/login', {
        form: form.toHTML(bootstrapField)
    })
})

router.post('/login', function(req,res){
    const form = createLoginForm();
    form.handle(req, {
        "success":async function(form) {
            // find the user by the email
            const user = await User.where({
                email: form.data.email
            }).fetch({
                require: false // no exception will be thrown if the user is not found
            })

            if (user) {
                // check the password
                // console.log("user.get(password)=>", user.get('password'));
                // console.log(form.data);
                if (await bcrypt.compare(form.data.password, user.get("password"))) {
                    req.session.userId = user.get('id');
                    req.session.userName = user.get('username');

                    // note: in the lab sheet it is
                    // req.session.user = {
                    //     id: user.get('id'),
                    //     name: user.get('name')
                    // }

                    res.redirect('/users/profile');
                } else {
                    req.flash("error_messages", "Unable to log in");
                    res.redirect('/users/login');
                }
            } else {
                req.flash("error_messages", "Unable to log in");
                res.redirect('/users/login');
            }

        }
    })
})

router.get('/profile', [checkIfAuthenticated], async function(req,res){
 
    res.render('users/profile', {
        user: req.session.user
    })
})

router.get('/logout', function(req,res){
    req.session.userId = null;
    req.flash("success_messages", "You have been logged out. See you again");
    res.redirect('/users/login');
})

module.exports = router;