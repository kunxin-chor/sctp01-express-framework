const { Tag, Category, Product } = require("../models");

async function getAllProducts() {
    return await Product.fetchAll();
} 

async function getAllTags() {
    const tags = await Tag.fetchAll()
                          .map(tag => [tag.get('id'), tag.get('name')]);
    return tags;
}

async function getAllCategories() {
    const allCategories = await Category.fetchAll()
                                        .map(category => [category.get('id'), category.get('name')]);
    return allCategories;
}

async function getProductById(productId){
    const product = await Product.where({
        'id': productId
    }).fetch({
        withRelated: ['tags', 'category'],
        require: false 
    }); 

    return product;

}

async function createProduct(productData) {
    const product = new Product();
    product.set('name', productData.name);
    product.set('cost', productData.cost);
    product.set('description', productData.description);
    product.set('category_id', productData.category_id);
    product.set('image_url', productData.image_url);

    // save the product first so we use its product
    await product.save();
    return product;
}

module.exports = {
    getAllTags,
    getAllCategories,
    getProductById,
    createProduct,
    getAllProducts
}