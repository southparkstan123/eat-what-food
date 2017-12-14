'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteFood = sequelize.define('voteFoods', {
    foodId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return voteFood;
};