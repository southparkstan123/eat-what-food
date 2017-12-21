'use strict';
module.exports = (sequelize, DataTypes) => {
  var dates = sequelize.define('dates', {
    date: DataTypes.INTEGER
  }, {
      classMethods: {
        associate: function (models) {
          // associations can be defined here
          dates.hasMany(models.voteDates, {
            foreignKey: "dateId", sourceKey: "id"
          })
          dates.belongsTo(models.chatrooms, {
            foreignKey: "id", sourceKey: "chatroomId"
          })
        }
      }
    });
  return dates;
};