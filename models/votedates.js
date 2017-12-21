'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteDates = sequelize.define('voteDate', {
    date: DataTypes.INTEGER
  });

  return voteDates;
};