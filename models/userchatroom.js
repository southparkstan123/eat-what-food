'use strict';
module.exports = (sequelize, DataTypes) => {
  var userChatroom = sequelize.define('userChatroom', {
    userId: DataTypes.INTEGER,
    isJoin: DataTypes.BOOLEAN,
    chatroomId: DataTypes.INTEGER,
  });

  userChatroom.associate = function (models) {
    // associations can be defined here
    userChatroom.belongsToMany(models.date, {
      foreignKey: "userChatroomId", sourceKey: "id", through: models.voteDate
    })
    userChatroom.belongsToMany(models.food, {
      foreignKey: "userChatroomId", sourceKey: "id", through: models.voteFood
    })
    userChatroom.belongsToMany(models.location, {
      foreignKey: "userChatroomId", sourceKey: "id", through: models.voteLocation
    })
  }

  return userChatroom;
};