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
  // Parameter 1: the table that will have the foreign key (FROM table)
  // Parameter 2: the table that has the primary key (TO table)
  // Parameter 3: the name of constraint
  // Parameter 4: an object. The KEY is the foreign key column, the VALUE is the primary key column
  return db.addForeignKey('products', 'categories', 'product_category_fk',{
    'category_id':"id"
  }, {
     onDelete:'CASCADE',
     onUpdate:'RESTRICT' // happens when you change the PRIMARY KEY
  });
};

exports.down = function(db) {
  return db.removeForeignKey('products', 'product_category_fk');
};

exports._meta = {
  "version": 1
};
