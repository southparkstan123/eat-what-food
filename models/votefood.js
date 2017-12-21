'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteFood = sequelize.define('voteFood', {
    foodId: DataTypes.INTEGER
  });

  return voteFood;
};