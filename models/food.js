'use strict';
module.exports = (sequelize, DataTypes) => {
  var food = sequelize.define('food', {
    foodName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return food;
};