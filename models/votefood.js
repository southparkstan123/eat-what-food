'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteFood = sequelize.define('voteFoods', {
    foodId: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          voteFood.belongsTo(models.userchatroom, {
            foreignKey: "id", sourceKey: "userChatroomId"
          })
          voteFood.belongsTo(models.food, {
            foreignKey: "id", sourceKey: "foodId"
          })
        }
      }
    });
  return voteFood;
};