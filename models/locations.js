'use strict';
module.exports = (sequelize, DataTypes) => {
  var locations = sequelize.define('locations', {
    locationName: DataTypes.STRING
  });

  locations.associate = function (models) {
    // associations can be defined here
    locations.hasMany(models.voteLocations, {
      foreignKey: "locationId", sourceId: "id"
    })
  }

  return locations;
};