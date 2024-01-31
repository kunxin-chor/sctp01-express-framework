const bookshelf = require('../bookshelf') // same as requiring ../bookshelf/index.js

// Create our first model
// bookshelf.model() creates a new model
// A model represents one table in the database
// 1st parameter: the NAME of the model
// 2nd parameter: configuration object
// Convention: The name of the model should the singular form
// of the table name and the first alphabet is upper case
const Product = bookshelf.model('Product',{
    tableName:'products'
})

module.exports = {
    Product
}