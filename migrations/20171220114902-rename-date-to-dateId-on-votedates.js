'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.renameColumn('voteDates', 'date', 'dateId')
  },

  down: (queryInterface, Sequelize) => {

    return queryInterface.renameColumn('voteDates', 'dateId', 'date')
  }
};
