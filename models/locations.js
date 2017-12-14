'use strict';
module.exports = (sequelize, DataTypes) => {
  var locations = sequelize.define('locations', {
    locationName: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return locations;
};