'use strict';
module.exports = (sequelize, DataTypes) => {
  var users = sequelize.define('users', {
    userName: DataTypes.STRING
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          users.hasMany(models.chatroom, { 
            foreignKey: "createdBy", sourceKey: "id" })
          users.hasMany(models.userchatroom, { 
            foreignKey: "userId", sourceKey: "id" })
        }
      }
    });
  return users;
};