'use strict';
module.exports = (sequelize, DataTypes) => {
  var chatroom = sequelize.define('chatrooms', {
    createdBy: DataTypes.INTEGER,
    chatroomName: DataTypes.STRING
  });

  chatroom.associate = function (models) {
    // associations can be defined here
    chatroom.belongsTo(models.users, {
      foreignKey: "id", sourceKey: "createdBy"
    })
    chatroom.hasMany(models.userchatroom, {
      foreignKey: "chatroomId", sourceKey: "id"
    })
  }

  return chatroom;
};