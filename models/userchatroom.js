'use strict';
module.exports = (sequelize, DataTypes) => {
  var userChatroom = sequelize.define('userChatrooms', {
    userId: DataTypes.INTEGER,
    isJoin: DataTypes.BOOLEAN,
    chatroomId: DataTypes.INTEGER,
  });

  userChatroom.associate = function (models) {
    // associations can be defined here
    userChatroom.belongsTo(models.users, {
      foreignKey: "id", sourceKey: "userId"
    })
    userChatroom.hasMany(models.voteLocations, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
    userChatroom.belongsTo(models.chatrooms, {
      foreignKey: "id", sourceKey: "chatroomId"
    })
    userChatroom.hasMany(models.voteFoods, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
    userChatroom.hasMany(models.voteDates, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
  }

  return userChatroom;
};