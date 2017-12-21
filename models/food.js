'use strict';
module.exports = (sequelize, DataTypes) => {
  var food = sequelize.define('food', {
    foodName: DataTypes.STRING
  });

  food.associate = function (models) {
    // associations can be defined here
    food.belongsToMany(models.userChatroom, {
      foreignKey: "foodId", sourceKey: "id", through: models.voteFood
    })
    food.belongsTo(models.chatroom, {
      foreignKey: "id", sourceKey: "chatroomId"
    })
  }

  return food;
};