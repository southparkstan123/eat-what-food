'use strict';
module.exports = (sequelize, DataTypes) => {
  var dates = sequelize.define('date', {
    date: DataTypes.INTEGER,
    chatroomId: DataTypes.INTEGER,
  });

  dates.associate = function (models) {
    // associations can be defined here
    dates.belongsToMany(models.userChatroom, {
      foreignKey: "dateId", sourceKey: "id", through: models.voteDate
    })
    dates.belongsTo(models.chatroom, {
      foreignKey: "id", sourceKey: "chatroomId"
    })
  }
  return dates;
};