'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    userName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return users;
};