const express = require('express');
const { Product } = require('../models');
const { createProductForm, bootstrapField } = require('../forms');

const router = express.Router();

router.get('/', async function (req, res) {
    // Same as SELECT * FROM products
    let products = await Product.collection().fetch();
    res.render("products/index", {
        products: products.toJSON()
    })
})

router.get('/create', async function (req, res) {
    // create an instance of the form
    const productForm = createProductForm();
    res.render('products/create', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async function (req, res) {
    const productForm = createProductForm();
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
            // save
            await product.save();
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

    // get the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true // if no such product is found, throw an exception
    }); // todo: use try...catch to catch exception and send back status 404

    // create the product form and prepopulate all its fields
    // with the existing value from the product which is being edited
    const productForm = createProductForm();
    productForm.fields.name.value = product.get('name');
    productForm.fields.description.value = product.get('description');
    productForm.fields.cost.value = product.get('cost');

    res.render('products/update', {
        form: productForm.toHTML(bootstrapField)
    })
})

router.post('/:product_id/update', async function(req,res){
    const productForm = createProductForm();

    // fetch the product that we want to update
    const product = await Product.where({
        id: req.params.product_id
    }).fetch({
        require: true
    })

    productForm.handle(req, {
        "success": async function(form) {
            // product.set('name', form.data.name);
            // product.set('cost', form.data.cost);
            // product.set('description', form.data.description);
            product.set(form.data);
            await product.save();
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
    res.redirect('/products');
})

module.exports = router;