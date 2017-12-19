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
    users.belongsToMany(models.chatrooms, {
      foreignKey: "userId", sourceKey: "id", as: "invited", through: models.userChatrooms
    })
  }

  return users;
};