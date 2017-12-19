'use strict';
module.exports = (sequelize, DataTypes) => {
  var chatroom = sequelize.define('chatrooms', {
    createdBy: DataTypes.INTEGER,
    chatroomName: DataTypes.STRING,
    url: DataTypes.STRING
  });

  chatroom.associate = function (models) {
    // associations can be defined here
    chatroom.belongsTo(models.users, {
      foreignKey: "id", sourceKey: "createdBy"
    })
    chatroom.belongsToMany(models.users, {
      foreignKey: "chatroomId", sourceKey: "id", as: "invited", through: models.userChatrooms
    })
  }

  return chatroom;
};