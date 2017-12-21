'use strict';
module.exports = (sequelize, DataTypes) => {
  var chatroom = sequelize.define('chatroom', {
    createdBy: DataTypes.INTEGER,
    chatroomName: DataTypes.STRING,
    url: DataTypes.STRING
  });

  chatroom.associate = function (models) {
    // associations can be defined here
    chatroom.belongsTo(models.user, {
      foreignKey: "id", sourceKey: "createdBy", as: "creates"
    })
    chatroom.belongsToMany(models.user, {
      foreignKey: "chatroomId", sourceKey: "id", as: "invited", through: models.userChatroom
    })
    chatroom.hasMany(models.date, {
      foreignKey: "chatroomId", sourceKey: "id", as: "containDates"
    })
    chatroom.hasMany(models.location, {
      foreignKey: "chatroomId", sourceKey: "id", as: "containLocations"
    })
    chatroom.hasMany(models.food, {
      foreignKey: "chatroomId", sourceKey: "id", as: "containFoods"
    })
  }

  return chatroom;
};