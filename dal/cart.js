const { CartItem, User } = require('../models');


/**
 * Get all the cart items that belongs to a user
 * @param {int} userId ID of the user that we want to get the cart items from 
 * @returns Bookshelf collection of all the cart items that belongs to the user
 */
const getCart = async (userId) => {
     return await CartItem.collection()
        .where({
            user_id: userId
        }).fetch({
            require: false,
            withRelated: ['product', 'product.category']
        })

    // Alternatively (not tested!)
    // const user = await User.where({
    //     id: userId
    // }).fetch({
    //     required: true,
    //     withRelated: ['cart_items']
    // });

    // return await user.related('cart_items')
}

/**
 * given a userId and a productId, get CartItem if the user has added this product to their shopping cart
 * @param {int} userId The ID of the user  
 * @param {int} productId The ID of the product 
 * @returns a bookshelf model that represents the CartItem
 */
const getCartItemByUserAndProduct = async (userId, productId) => {
    return await CartItem.where({
        'user_id': userId,
        'product_id': productId
    }).fetch({
        require: false
    })
}

async function createCartItem(userId, productId, quantity) {
    const cartItem = new CartItem({
        user_id: userId,
        product_id: productId,
        quantity: quantity
    })
    await cartItem.save();
    return cartItem;
}

async function updateQuantityRelative(userId, productId, amount) {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    cartItem.set('quantity', cartItem.get('quantity')+amount);
    await cartItem.save();
}

async function updateQuantity(userId, productId, amount) {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    cartItem.set('quantity', amount);
    await cartItem.save();
}


async function removeFromCart(userId, productId) {
    const cartItem = await getCartItemByUserAndProduct(userId, productId);
    if (cartItem) {
        await cartItem.destroy();
        return true;
    }
    return false;
}

module.exports = {
    getCart,
    getCartItemByUserAndProduct,
    createCartItem, 
    updateQuantityRelative, 
    updateQuantity, 
    removeFromCart
};