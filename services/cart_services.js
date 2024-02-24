const cartDataLayer = require('../dal/cart');

async function addToCart(userId, productId, quantity) {
    // ideas for business logic
    // 1. check if there is enough stock
    // 2. check if the user has met maxmimum quota
    // 3. discount code or discount coupon 
    // 4. retargeting, sending user reminder email

    // if the user doesn't have cart item for this product, then create a new one
    const cartItem = await cartDataLayer.getCartItemByUserAndProduct(userId, productId);
    if (!cartItem) {
        // if the user already have, get the existing item and increases its quantity by 1
        await cartDataLayer.createCartItem(userId, productId, quantity);
    } else {
        await cartDataLayer.updateQuantityRelative(userId, productId, 1);
    }
}

async function getCart(userId) {
    return await cartDataLayer.getCart(userId);
}

async function removeFromCart(userId, productId) {
    return await cartDataLayer.removeFromCart(userId, productId);
}

async function updateQuantity(userId, productId, quantity) {
    return await cartDataLayer.updateQuantity(userId, productId, quantity);
}

module.exports = {addToCart, getCart, removeFromCart, updateQuantity}