'use strict';
module.exports = (sequelize, DataTypes) => {
  var userChatroom = sequelize.define('userChatrooms', {
    userId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return userChatroom;
};