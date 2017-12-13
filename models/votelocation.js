'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteLocation = sequelize.define('voteLocations', {
    locationId: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return voteLocation;
};