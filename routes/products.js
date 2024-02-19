const express = require('express');
const { Product, Category, Tag } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');

const router = express.Router();

router.get('/', async function (req, res) {
    
    // Same as SELECT * FROM products
    let products = await Product.collection().fetch({
        withRelated:['category'] 
    });
    res.render("products/index", {
        products: products.toJSON()
    })
})

router.get('/create', async function (req, res) {

    // do a mapping
    // for each category, return an array with two element (index 0 is ID, index 1 is name)
    // and push it onto allCategories, which will be an array
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);

    // Get all the Tags and map them into an array of array, and for each inner array, element 0 is ID and element 1 is the name
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);

    // create an instance of the form
    const productForm = createProductForm(allCategories, tags);
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
    // Get all the Tags and map them into an array of array, and for each inner array, element 0 is ID and element 1 is the name
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
 
 
    const productForm = createProductForm(allCategories, tags);
    // start the form processing
    productForm.handle(req, {
        "success": async function (form) {
            // we want to extract the information
            // submitted in the form and create a new product

            // If we are referring to the model name (eg. Product)
            // we are referring to the entire table

            // If we are creating a new instance of the model (like below)
            // it means we are referring a ROW in the table
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('category_id', form.data.category_id)
        
            // save the product first so we use its product
            await product.save();

            let tags = form.data.tags;
            // the tags will be in comma delimited form
            // so for example if the user selects ID 3, 5 and 6
            // then form.data.tags will be "3,5,6"
            if (tags) {
                // the attach function requires an array of IDs
                // In this we case, we are attach IDs to the product's tags 
                // (hence the ID should be tag ids)
               
                await product.tags().attach(tags.split(','));
            }

            // IMPORTANT! For Flash messages to work, you must use it before a redirect
            req.flash("success_messages", "New product has been added");  // req.session.messages.success_messages = [ "New product hass been added"];
            res.redirect('/products');
  

        },
        "error": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        },
        "empty": function (form) {
            res.render('products/create', {
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async function (req, res) {
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);

    // get the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        withRelated:['tags'],
        require: true // if no such product is found, throw an exception
    }); // todo: use try...catch to catch exception and send back status 404

    // create the product form and prepopulate all its fields
    // with the existing value from the product which is being edited
    const productForm = createProductForm(allCategories, tags);

    productForm.fields.name.value = product.get('name');
    productForm.fields.description.value = product.get('description');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.category_id.value = product.get('category_id');

    // get all the selected tags' id
    const selectedTags = await product.related('tags').pluck('id');
    console.log(selectedTags);
    productForm.fields.tags.value = selectedTags;

    res.render('products/update', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/:product_id/update', async function(req,res)
{
    const tags = await Tag.fetchAll().map( tag =>  [tag.get('id'), tag.get('name')]);
    const allCategories = await Category.fetchAll().map(category => [category.get('id'), category.get('name')]);
    const productForm = createProductForm(allCategories, tags);

    // fetch the product that we want to update
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true,
        withRelated:['tags']
    })

    productForm.handle(req, {
        "success": async function(form) {
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            let {tags, ...productData} = form.data;
            // productData will be the original form.data without the `tags` key
            product.set(productData);
            await product.save();

            // update the M:N relationship with tags
            let tagIds = tags.split(",");

            // get and remove all the existing tags
            const existingTagIds = await product.related('tags').pluck('id');
            await product.tags().detach(existingTagIds);

            // Attach all the selected tags to the product
            await product.tags().attach(tagIds);

            res.redirect('/products');
        },
        "error": async function(form) {
            res.render('products/update',{
                form: form.toHTML(bootstrapField)
            })
        },
        "empty":async function(form){
            res.render('products/update',{
                form: form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', async function(req,res){
     // get the product that we want to delete
     const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // if no such product is found, throw an exception
    }); 

    res.render('products/delete', {
        product: product.toJSON()
    })
})

router.post('/:product_id/delete', async function(req,res){
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // if no such product is found, throw an exception
    }); 
    await product.destroy();
    req.flash("success_messages", "Product has been deleted");
    res.redirect('/products');
})

module.exports = router;