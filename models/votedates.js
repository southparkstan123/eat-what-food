'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteDates = sequelize.define('voteDates', {
    date: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return voteDates;
};