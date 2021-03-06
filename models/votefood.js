'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteFood = sequelize.define('voteFoods', {
    foodId: DataTypes.INTEGER
  });

  voteFood.associate = function (models) {
    // associations can be defined here
    voteFood.belongsTo(models.userChatrooms, {
      foreignKey: "id", sourceKey: "userChatroomId"
    })
    voteFood.belongsTo(models.food, {
      foreignKey: "id", sourceKey: "foodId"
    })
  }

  return voteFood;
};