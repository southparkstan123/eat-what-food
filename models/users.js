'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('user', {
    userName: DataTypes.STRING,
    facebookId: DataTypes.BIGINT
  });

  users.associate = function (models) {
    // associations can be defined here
    users.hasMany(models.chatroom, {
      foreignKey: "createdBy", sourceKey: "id", as: "creates"
    })
    users.belongsToMany(models.chatroom, {
      foreignKey: "userId", sourceKey: "id", as: "invited", through: models.userChatroom
    })
  }

  return users;
};