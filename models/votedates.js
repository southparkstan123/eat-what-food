'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteDates = sequelize.define('voteDates', {
    dateId: DataTypes.INTEGER
  });

  voteDates.associate = function (models) {
    // associations can be defined here
    voteDates.belongsTo(models.userChatroom, {
      foreignKey: "id", sourceKey: "userChatroomId"
    })
    voteDates.belongsTo(models.date, {
      foreignKey: "id", sourceKey: "date"
    })
  }

  return voteDates;
};