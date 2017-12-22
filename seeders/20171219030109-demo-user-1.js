'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('Person', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
    return queryInterface.bulkInsert('users', [{
      //uid: 1, //primary key autogenerated 
      userName: 'alex01',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      //uid: 1, //primary key autogenerated 
      userName: 'alex02',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      //uid: 1, //primary key autogenerated 
      userName: 'alex03',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    ], { returning: true }).then(function (users) {
      console.log("users length: ", users.length);
      let chatroomArr = [];
      for (let i = 0; i < users.length; i++) {
        let id = users[i].id;
        chatroomArr.push({
          createdBy: id,
          chatroomName: 'chatroom_' + id,
          url: 'ccc0000' + id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      //console.log("chatroomArr: ", chatroomArr);

      return queryInterface.bulkInsert('chatrooms', chatroomArr, { returning: true }).then(function(chatrooms){
        console.log("chatrooms: ", chatrooms);
        let userChatroomArr = [];
        for (let i = 0; i < chatrooms.length; i++) {
          for (let j = 0; j < users.length; j++) {
              userChatroomArr.push({
                    userId: users[j].id,
                    chatroomId: chatrooms[i].id,
                    isJoin: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
              });
          }
        }
        return queryInterface.bulkInsert('userChatrooms', userChatroomArr, {returning:true}).then() ;
        //console.log(userChatroomArr);
      });
    });
  },


  down: (queryInterface, Sequelize) => {

    return queryInterface.bulkDelete('userChatrooms', null, {returning: true}).then(function() {
      return queryInterface.bulkDelete('chatrooms', null, {returning: true}).then(function() {
        return queryInterface.bulkDelete('users', null, {});
      });
    });
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.
  
      Example:
      return queryInterface.bulkDelete('Person', null, {});
    */
  }
}