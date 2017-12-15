'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteLocation = sequelize.define('voteLocations', {
    locationId: DataTypes.INTEGER
  });

  voteLocation.associate = function (models) {
    // associations can be defined here
    voteLocation.belongsTo(models.userchatroom, {
      foreignKey: "id", sourceKey: "userChatroomId"
    })
    voteLocation.belongsTo(models.locations, {
      foreignKey: "id", sourceKey: "locationId"
    })
  }

  return voteLocation;
};