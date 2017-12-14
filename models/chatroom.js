'use strict';
module.exports = (sequelize, DataTypes) => {
  var chatroom = sequelize.define('chatrooms', {
    creator: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          chatroom.belongsTo(models.users, {
            foreignKey: "id", sourceKey: "createdBy"
          })
          chatroom.hasMany(models.userchatroom, {
            foreignKey: "chatroomId", sourceKey: "id"
          })
        }
      }
    });
  return chatroom;
};