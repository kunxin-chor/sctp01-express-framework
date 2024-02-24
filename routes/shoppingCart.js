const express = require('express');
const router = express.Router();

const cartServices = require('../services/cart_services');

router.get('/', async function(req,res){
    // get the items from the shopping cart
    // note: in the lab sheet  it is req.session.user.id!
    const cartItems = await cartServices.getCart(req.session.userId);
    res.render('cart/index', {
        cartItems: cartItems.toJSON()
    })
})

router.get('/:product_id/add', async function (req,res){
    await cartServices.addToCart(req.session.userId, req.params.product_id, 1);
    req.flash('success_messages', "Addd to shopping cart");
    res.redirect('/products');
})

router.get('/:product_id/remove', async function(req,res){
    await cartServices.removeFromCart(req.session.userId, req.params.product_id);
    req.flash('success_messages', "Item removed from cart");
    res.redirect('/cart');
})

router.post('/:product_id/updateQuantity', async function(req,res){
    const newQuantity = req.body.newQuantity;
    if (newQuantity <=0) {
        req.flash("error_messages", "Quantity must be higher than 0");
        res.redirect("/cart");
    }
    await cartServices.updateQuantity(
        req.session.userId,
        req.params.product_id,
        newQuantity
    )
    req.flash("success_messages", "Quantity updated!");
    res.redirect("/cart");

})

module.exports = router;