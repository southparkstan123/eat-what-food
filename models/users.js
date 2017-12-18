'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    userName: DataTypes.STRING,
    facebookId: DataTypes.BIGINT
  });

  users.associate = function (models) {
    // associations can be defined here
    users.hasMany(models.chatrooms, {
      foreignKey: "createdBy", sourceKey: "id", as: "creates"
    })
    users.hasMany(models.userChatrooms, {
      foreignKey: "userId", sourceKey: "id", as: "invited"
    })
  }

  return users;
};