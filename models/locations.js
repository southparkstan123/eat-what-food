'use strict';
module.exports = (sequelize, DataTypes) => {
  var locations = sequelize.define('location', {
    locationName: DataTypes.STRING
  });

  locations.associate = function (models) {
    // associations can be defined here
    locations.belongsToMany(models.userChatroom, {
      foreignKey: "locationId", sourceKey: "id", through: models.voteLocation
    })
    locations.belongsTo(models.chatroom, {
      foreignKey: "id", sourceKey: "chatroomId"
    })
  }

  return locations;
};