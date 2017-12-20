'use strict';
module.exports = (sequelize, DataTypes) => {
  var date_poll = sequelize.define('date_poll', {
    date: DataTypes.STRING,
    num_of_vote: DataTypes.INTEGER,
    voted_ppl: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return date_poll;
};