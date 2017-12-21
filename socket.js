const session = require("./session");
const socketIOSession = require("socket.io.session");
const client = require('./database');
const uuidv1 = require('uuid/v1');
const ChatRoomModel = require('./models').chatrooms;
const UserModel = require('./models').users;
const UserChatroomModel = require('./models').userChatrooms;
const VoteDatesModel = require('./models').voteDates;
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
            const user_fb_id = socket.session.passport.user.profile.id;
            //update db
            console.log(data);

            UserModel.findOne({
                where: {
                    facebookId: {
                        [Op.eq]: socket.session.passport.user.profile.id
                    }
                },
                include: {
                    model: ChatRoomModel,
                    as: 'invited',
                    where: {
                        url: {
                            [Op.eq]: data.chatroom_url
                        }
                    }
                }
            }).then((user) => {
                //create a record to voteDates table
                VoteDatesModel.create({
                    date: data.date,
                    userChatroomId: user.invited[0].userChatrooms.id,
                }).then((voteDates) => {
                    let find_number_of_ppl_voted = (chatroom_url) => {
                        sequelize.query(`SELECT vd.date, COUNT(vd.date) 
                                    FROM chatrooms AS cr 
                                    INNER JOIN "userChatrooms" AS uc on cr.id = uc."chatroomId" 
                                    INNER JOIN "voteDates" AS vd on vd."userChatroomId" = uc.id 
                                    where cr.url = :chatroomURL 
                                    GROUP BY vd.date `,
                            { replacements: { chatroomURL: chatroom_url }, type: sequelize.QueryTypes.SELECT })
                            .then((voteData) => {
                                let output = [];
                                let total_number_of_ppl = 20;
                                for (let i = 0; i < voteData.length; i++) {
                                    output.push({
                                        date: voteData[i].date,
                                        percent_of_people: (parseInt(voteData[i].count)) / total_number_of_ppl * 100
                                    })
                                }
                                io.to("chatroom_" + chatroom_url)('date_table_updated', output);
                            }).catch((err) => {
                                console.log(err);
                            })
                    }
                    find_number_of_ppl_voted(data.chatroom_url);
                })
            }).catch(err => console.log(err));
        });

        socket.on('date_vote_increase', (pk,chatroom_url) => {
            const user_fb_id = socket.session.passport.user.profile.id;



            let output = [];
            io.to("chatroom_" + chatroom_url).emit('date_table_updated', output)
        })
        socket.on('date_vote_decrease', (pk,chatroom_url) => {

            io.to("chatroom_" + chatroom_url).emit('date_table_updated', data)
        })
        socket.on('page_loaded', (chatroom_url) => {

            const user_fb_id = socket.session.passport.user.profile.id;

            let find_number_of_ppl_voted = (chatroom_url) => {

                sequelize.query(`SELECT vd.date, COUNT(vd.date) 
                                FROM chatrooms AS cr 
                                INNER JOIN "userChatrooms" AS uc on cr.id = uc."chatroomId" 
                                INNER JOIN "voteDates" AS vd on vd."userChatroomId" = uc.id 
                                where cr.url = :chatroomURL 
                                GROUP BY vd.date `,
                    { replacements: { chatroomURL: chatroom_url }, type: sequelize.QueryTypes.SELECT })
                    .then((voteData) => {
                        let output = [];
                        let total_number_of_ppl = 20;
                        for (let i = 0; i < voteData.length; i++) {
                            output.push({
                                date: voteData[i].date,
                                percent_of_people: (parseInt(voteData[i].count)) / total_number_of_ppl * 100
                            })
                        }
                        io.to("chatroom_" + chatroom_url).emit('date_table_updated', output);
                    }).catch((err) => {
                        console.log(err);
                    })
            }
            find_number_of_ppl_voted(chatroom_url);
        })
    });

    io.on('send_message', (socket) => {
        socket.emit('print_message', socket.session.passport.user);
    })


    return io;
}