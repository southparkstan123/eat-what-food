'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteLocation = sequelize.define('voteLocation', {
    locationId: DataTypes.INTEGER
  });

  return voteLocation;
};