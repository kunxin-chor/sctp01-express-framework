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

// The `up` function is called when you want to add new change
/*
 CREATE TABLE products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cost INT UNISIGNED NOT NULL,
  description TEXT
 ) engine = innodb;
*/
exports.up = function(db) {
  // db.createTable takes two parameters
  // 1st parameter - the name of the table
  // 2nd parameter - an object that has all the columns
  //       each key will be the name of the column
  return db.createTable("products", {
    id: {
      type:"int", primaryKey:true, autoIncrement:true, unsigned:true
    },
    name: {type:'string', length:100, notNull:true},
    cost: {type:'int', unsigned: true, notNull:true},
    description:"text"
  })
};

// The `down` is called when you want to undo the changes
exports.down = function(db) {
  return db.dropTable("products");
};

exports._meta = {
  "version": 1
};
