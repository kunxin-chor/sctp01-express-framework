'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  // for Bookshelf ORM to act elegantly (i.e without having to write extra code)
  // the name of the join table MUST BE the two table names, arranged in alphabetal order, seperated by a underscore
  return db.createTable('products_tags', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true
    },
    // product_id foreign key must follow the format:
    // <singular_form_of_the_table_name>_id
    product_id: {
      type:'int',
      notNull: true,
      unsigned: true,
      foreignKey:{
        name: 'products_tags_product_fk',
        table: 'products',
        rules:{
          onDelete:'CASCADE',
          onUpdate:'RESTRICT'
        },
        mapping:'id' // -> product_id in this table will map to `id` column in the products table
      }
    },
    tag_id: {
      type:'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name:'products_tags_tag_fk',
        table:'tags',
        mapping:'id',
        rules:{
          onDelete:"CASCADE",
          onUpdate:"RESTRICT"
        }
      }
    }
  })
};

exports.down = function(db) {
  return db.dropTable('products_tags');
};

exports._meta = {
  "version": 1
};
