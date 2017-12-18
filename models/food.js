'use strict';
module.exports = (sequelize, DataTypes) => {
  var food = sequelize.define('food', {
    foodName: DataTypes.STRING
  });

  food.associate = function (models) {
    // associations can be defined here
    food.hasMany(models.voteFoods, {
      foreignKey: "foodId", sourceKey: "id"
    })
  }

  return food;
};