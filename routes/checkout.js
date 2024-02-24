const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require('express');
const cartServices = require('../services/cart_services');
const router = express.Router();

router.get('/', async function(req,res){
    // 1. get all the items from the shopping cart
    const items = await cartServices.getCart(req.session.userId);

    // 2. create the line items
    // - the 'payment order' for the cart
    const lineItems = [];
    for (let i of items) {
        // the key/value pairs of the line item
        // is fixed by Stripe and cannot be changed

        const oneLineItem = {
            quantity: i.get('quantity'),
            price_data: {
                currency: 'SGD',
                unit_amount: i.related('product').get('cost'),
                product_data: {
                    name: i.related('product').get('name'),
                    // NEW! Store the product_id as meta data
                    metadata: {
                        product_id: i.get('product_id'),
                        quantity: i.get('quantity')
                    }
                }
            }
        }

        // add in the image if it exists
        if (i.related('product').get('image_url')) {
            // add the images key to the product_data object
            oneLineItem.price_data.product_data.images=[ i.related('product').get('image_url')]
        }
        lineItems.push(oneLineItem);
    }

    // 3. get the session id from Stripe
    const payment = {
        payment_method_types: ['card'],
        mode: 'payment', // indicate it's immediate payment
        line_items: lineItems,
        success_url: "https://www.google.com",
        cancel_url: "https://www.yahoo.com",
        metadata: {
            'user_id': req.session.userId
        }
    }

    const stripeSession = await Stripe.checkout.sessions.create(payment);
   
    // 4. send the session id back to the hbs file
    res.render('checkout/index', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
});

// Endpoint for Stripe to consume when a payment is successful
router.post('/process_payment', express.raw({
    type:'application/json'
}),  async function(req,res){
    // extract out the payload
    const payload = req.body;

    // need to verify the request is from Stripe
    // we can verify by checking the signature in the headers
    const sigHeader = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let event;
    try {
        event = Stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);
        if (event.type == "checkout.session.completed") {
            const stripeSession = event.data.object;
            // retrieve the session and notify Stripe to return the line items
            const session = await Stripe.checkout.sessions.retrieve(
                stripeSession.id, {
                expand: ['line_items']
              });
            
              const lineItems = await Stripe.checkout.sessions.listLineItems(stripeSession.id, {
                expand: ['data.price.product'],
              });

              for (let i of lineItems.data) {
                // TODO: add those info to the db
                console.log(i.price);
                console.log("Metadata: ", i.price.product.metadata)
              }
            res.send({
                'message': 'success'
            })
        }
    } catch (e) {
        console.log(e.message);
        res.send({
            'error': e.message
        })
    }
});


module.exports = router;