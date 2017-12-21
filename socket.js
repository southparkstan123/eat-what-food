const session = require("./session");
const socketIOSession = require("socket.io.session");
const client = require('./database');
const uuidv1 = require('uuid/v1');

const ChatRoomModel = require('./models').chatroom;
const UserModel = require('./models').user;
const UserChatroomModel = require('./models').userChatroom;
const DateModel = require('./models').date;
const VoteDateModel = require('./models').voteDate;


const sequelize = require('./models').sequelize;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

client.once('ready', function () {
    // Flush Redis DB
    client.flushdb();

});

module.exports = (server) => {
    const io = require('socket.io')(server);



    //"sessionSettings" same config as http-session used 
    const socketSession = socketIOSession(session.settings);

    io.use(socketSession.parser);

    io.use((socket, next) => {
        if (!socket.session.passport) {
            socket.disconnect();
        } else {
            next();
        }
    });

    io.on('connection', (socket) => {

        socket.emit('user_online', socket.session.passport.user);

        socket.on('user_enter_chatroom', (chatroom_url) => {
            let userObj = {
                userID: socket.session.passport.user.profile.id,
                username: socket.session.passport.user.profile.displayName
            };

            client.sadd('users_in_chatroom_' + chatroom_url, JSON.stringify(userObj), (err, reply) => {
                if (reply === 1) {
                    console.log('enter');
                    console.log(reply);

                    socket.join("chatroom_" + chatroom_url);

                    io.to("chatroom_" + chatroom_url).emit('add_user_in_chatroom', userObj);
                } else if (reply === 0) {
                    errorMessage = 'You have already enter this chatroom!'
                    io.to("chatroom_" + chatroom_url).emit('error_message', errorMessage);
                }
            });
        });

        socket.on('load_users_in_chatroom_from_redis', (chatroom_url) => {
            client.smembers('users_in_chatroom_' + chatroom_url, (err, reply) => {
                if (reply) {
                    let online_user_list = reply.map((user) => {
                        return JSON.parse(user);
                    });
                    console.log('list');
                    console.log(online_user_list);
                    socket.join("chatroom_" + chatroom_url);
                    io.in('chatroom_' + chatroom_url).emit('show_users_in_chatroom', online_user_list);
                }
            });
        });

        socket.on('load_messages_from_redis', (chatroom_url) => {
            client.lrange('message_list_for_' + chatroom_url, 0, -1, (err, reply) => {
                if (reply) {
                    let message_list = reply.map((message) => {
                        return JSON.parse(message);
                    })
                    console.log('messages');
                    console.log(message_list);
                    io.to("chatroom_" + chatroom_url).emit('display_all_messages', message_list);
                }
            });
        });

        socket.on('send_message', (chatroom_url, content) => {
            let messageObj = {
                username: socket.session.passport.user.profile.displayName,
                userid: socket.session.passport.user.profile.id,
                content: content,
                date: new Date().getTime()
            };

            client.rpush('message_list_for_' + chatroom_url, JSON.stringify(messageObj), (err, reply) => {
                if (reply) {
                    io.to("chatroom_" + chatroom_url).emit('display_sent_message', messageObj);
                }
            });
        });

        socket.on('user_logout', () => {
            client.lrange('online_user_list', 0, -1, (err, reply) => {
                if (reply) {
                    let old_user_list = reply.map((user) => {
                        return JSON.parse(user);
                    });
                    console.log(old_user_list);
                    let leave_user = old_user_list.filter((user) => {
                        return user.userID == socket.session.passport.user.profile.id;
                    });
                    console.log(JSON.stringify(leave_user[0]));
                    client.lrem('online_user_list', 0, JSON.stringify(leave_user[0]), (err, reply) => {
                        if (reply) {
                            client.lrange('online_user_list', 0, -1, (err, reply) => {
                                if (reply) {
                                    let new_user_list = reply.map((user) => {
                                        return JSON.parse(user);
                                    });
                                    io.emit('display_userlist', new_user_list);
                                }
                            });
                        }
                    })
                }
            });
        });

        socket.on('user_leave_chatroom', (chatroom_url) => {
            client.smembers('users_in_chatroom_' + chatroom_url, (err, reply) => {
                if (reply) {
                    let old_user_list = reply.map((user) => {
                        return JSON.parse(user);
                    });
                    // console.log(old_user_list);
                    let leave_user = old_user_list.filter((user) => {
                        return user.userID == socket.session.passport.user.profile.id;
                    });
                    // console.log(JSON.stringify(leave_user[0]));
                    client.srem('users_in_chatroom_' + chatroom_url, 0, JSON.stringify(leave_user[0]), (err, reply) => {
                        if (reply) {
                            client.smembers('users_in_chatroom_' + chatroom_url, (err, reply) => {
                                if (reply) {
                                    let new_user_list = reply.map((user) => {
                                        return JSON.parse(user);
                                    });
                                    io.to("chatroom_" + chatroom_url).emit('show_users_in_chatroom', new_user_list);
                                }
                            });
                        }
                    })
                }
            });
        });

        socket.on('date_created', (data) => {
            UserModel.findOne({
                where: {
                    facebookId: {
                        [Op.eq]: socket.session.passport.user.profile.id
                    }
                },
                attributes: ['id']
            }).then(user => {
                UserChatroomModel.findOne({
                    where: {
                        userId: {
                            [Op.eq]: user.id
                        },
                        chatroomId: {
                            [Op.eq]: data.chatroom_id
                        },
                    },
                    attributes: ['id']
                }).then(userChatroom => {
                    DateModel.findOrCreate({
                        where: {
                            date: data.date,
                        },
                        defaults: {
                            date: data.date,
                            chatroomId: data.chatroom_id
                        }
                    }).spread((date, created) => {
                        if (created) {
                            //Update vote date result
                            updateVoteDateResult(io, data.chatroom_id, data.chatroom_url, userChatroom.id);

                            // let query = `SELECT d."id", 
                            // COUNT(vd.id) AS "totalVote", 
                            // (SELECT COUNT(*) FROM "voteDates" AS vd2 WHERE vd2."userChatroomId" = :userChatroomId AND vd2."dateId" = d.id) AS "userVote",
                            // d.date
                            // FROM dates AS d
                            // LEFT JOIN "voteDates" AS vd ON d.id = vd."dateId"
                            // where d."chatroomId" = :chatroomId group by d.id`;

                            // sequelize.query(query,{ 
                            //     replacements: { 
                            //         chatroomId: data.chatroom_id,
                            //         userChatroomId: userChatroom.id
                            //     }, type: sequelize.QueryTypes.SELECT 
                            // }).then((voteData) => {
                            //     io.emit('date_table_updated', vote);
                            // }).catch(err => console.log(err));
                        } else {
                            io.emit('error_message_for_date', 'This date is already existed!');
                        }
                    }).catch(err => console.log(err));
                })
            })
        });

        socket.on('date_vote_increase', (data) => {
            UserModel.findOne({
                where: {
                    facebookId: {
                        [Op.eq]: socket.session.passport.user.profile.id
                    }
                },
                attributes: ['id']
            }).then((user) => {
                UserChatroomModel.findOne({
                    where: {
                        userId: {
                            [Op.eq]: user.id
                        },
                        chatroomId: {
                            [Op.eq]: data.chatroom_id
                        },
                    },
                    attributes: ['id']
                }).then((userChatroom) => {

                    VoteDateModel.create({
                        date: data.date,
                        userChatroomId: userChatroom.id
                    }).then(voteDate => {
                        updateVoteDateResult(io, data.chatroom_id, data.chatroom_url, userChatroom.id);
                    }).catch(err => console.log(err));

                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });

        socket.on('date_vote_decrease', (pk, chatroom_url) => {
            UserModel.findOne({
                where: {
                    facebookId: {
                        [Op.eq]: socket.session.passport.user.profile.id
                    }
                },
                attributes: ['id']
            }).then((user) => {
                UserChatroomModel.findOne({
                    where: {
                        userId: {
                            [Op.eq]: user.id
                        },
                        chatroomId: {
                            [Op.eq]: data.chatroom_id
                        },
                    },
                    attributes: ['id']
                }).then((userChatroom) => {
                    VoteDateModel.destroy({
                        date: data.date,
                        userChatroomId: userChatroom.id
                    }).then(voteDate => {
                        updateVoteDateResult(io, data.chatroom_id, data.chatroom_url, userChatroom.id);
                    }).catch(err => console.log(err));
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));

            io.to("chatroom_" + chatroom_url).emit('date_table_updated', data)
        })
        socket.on('page_loaded', (data) => {
            UserModel.findOne({
                where: {
                    facebookId: {
                        [Op.eq]: socket.session.passport.user.profile.id
                    }
                },
                attributes: ['id']
            }).then(user => {
                UserChatroomModel.findOne({
                    where: {
                        userId: {
                            [Op.eq]: user.id
                        },
                        chatroomId: {
                            [Op.eq]: data.chatroom_id
                        },
                    },
                    attributes: ['id']
                }).then((userChatroom) => {
                    //Update vote date result
                    updateVoteDateResult(io, data.chatroom_id, data.chatroom_url, userChatroom.id);
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });

        io.on('send_message', (socket) => {
            socket.emit('print_message', socket.session.passport.user);
        })


        return io;
    });
}

function updateVoteDateResult(io, chatroomId, chatroomUrl, userChatroomId) {
        let query = `SELECT d."id", 
            COUNT(vd.id) AS "totalVote", 
            (SELECT COUNT(*) FROM "voteDates" AS vd2 WHERE vd2."userChatroomId" = :userChatroomId AND vd2."dateId" = d.id) AS "userVote",
            d.date
            FROM dates AS d
            LEFT JOIN "voteDates" AS vd ON d.id = vd."dateId"
            where d."chatroomId" = :chatroomId group by d.id`;

        sequelize.query(query, {
            replacements: {
                chatroomId: chatroomId,
                userChatroomId: userChatroomId
            }, type: sequelize.QueryTypes.SELECT
        }).then((voteData) => {
            io.to("chatroom_" + chatroomUrl).emit('date_table_updated', voteData);
        }).catch(err => console.log(err));
    }

