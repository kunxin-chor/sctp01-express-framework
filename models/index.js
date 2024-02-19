const bookshelf = require('../bookshelf') // same as requiring ../bookshelf/index.js

// Create our first model
// bookshelf.model() creates a new model
// A model represents one table in the database
// 1st parameter: the NAME of the model
// 2nd parameter: configuration object
// Convention: The name of the model should the singular form
// of the table name and the first alphabet is upper case
const Product = bookshelf.model('Product',{
    tableName:'products',
    category:function() {
        // for this to work
        // 1. the foregin key name must be the `<other_table_name_in_lower_case_singular_form>_id`
        return this.belongsTo('Category'); // one product belongs to one category
                                           // a product row has a FK pointing to one row in the categories table
    },
    tags:function() {
        return this.belongsToMany('Tag');
    }
})

const Category = bookshelf.model('Category',{
    tableName:'categories',
    products:function(){
        return this.belongsToMany('Product')
    }
})

const Tag = bookshelf.model("Tag",{
    tableName:'tags',
    products:function() {
        return this.hasMany('Product')
    }
})

const User = bookshelf.model('User', {
    tableName:'users'
})

module.exports = {
    Product, Category, Tag, User
}