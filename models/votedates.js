'use strict';
module.exports = (sequelize, DataTypes) => {
  var voteDates = sequelize.define('voteDates', {
    date: DataTypes.INTEGER
  });

  voteDates.associate = function (models) {
    // associations can be defined here
    voteDates.belongsTo(models.userChatrooms, {
      foreignKey: "id", sourceKey: "userChatroomId"
    })
  }

  return voteDates;
};