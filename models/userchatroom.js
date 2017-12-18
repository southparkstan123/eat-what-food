'use strict';
module.exports = (sequelize, DataTypes) => {
  var userChatroom = sequelize.define('userChatrooms', {
    userId: DataTypes.INTEGER
  });

  userChatroom.associate = function (models) {
    // associations can be defined here
    userChatroom.belongsTo(models.users, {
      foreignKey: "id", sourceKey: "userId"
    })
    userChatroom.hasMany(models.votelocation, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
    userChatroom.belongsTo(models.chatroom, {
      foreignKey: "id", sourceKey: "chatroomId"
    })
    userChatroom.hasMany(models.votefood, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
    userChatroom.hasMany(models.votedates, {
      foreignKey: "userChatroomId", sourceKey: "id"
    })
  }

  return userChatroom;
};