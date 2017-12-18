'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    userName: DataTypes.STRING
  });

  users.associate = function (models) {
    // associations can be defined here
    users.hasMany(models.chatrooms, {
      foreignKey: "createdBy", sourceKey: "id"
    })
    users.hasMany(models.userChatrooms, {
      foreignKey: "userId", sourceKey: "id"
    })
  }

  return users;
};