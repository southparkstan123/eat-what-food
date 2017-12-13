'use strict';
module.exports = (sequelize, DataTypes) => {
  var chatroom = sequelize.define('chatrooms', {
    creator: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return chatroom;
};