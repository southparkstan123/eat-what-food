const express = require('express');
const app = express();
const http = require('http').Server(app);
const passport = require('passport');
const client = require('./database');
const UserModel = require('./models').users;
const ChatroomModel = require('./models').chatrooms;
const UserChatroomModel = require('./models').userChatrooms;
const sequelize = require('sequelize');
const Op = sequelize.Op;
const uuidv1 = require('uuid/v1');

module.exports = (express) => {
    const router = express.Router();

    // Function to protect the route /secret from being accessed without authorization.
    let isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }else{
            res.redirect('/login');
        }
    }

    let isLoggedOut = (req, res, next) => {
        if (req.isAuthenticated()) {
            res.redirect('/');
        }else{
            return next();
        }
    }

    router.get('/', isLoggedIn ,(req,res) =>{
        res.render('lobby');
    });

    // The Authentication Route
    router.get('/auth/facebook', passport.authenticate('facebook',{ 
        scope: ['user_friends', 'manage_pages'] 
    }));

    // The Redirect URL route.
    router.get('/auth/facebook/callback', passport.authenticate('facebook',{ 
        failureRedirect:'/login'
    }),(req,res) => {

        UserModel.findOrCreate(
            {
                where: {
                    facebookId: req.user.profile.id
                },
                defaults: {
                    facebookId: req.user.profile.id,
                    userName : req.user.profile.displayName
                }
            }
        ).spread((user, created) => {
            console.log(user.get({
                plain: true
            }))

            client.rpush('online_user_list', JSON.stringify(user), (err, reply) =>{
                if(reply){
                    console.log(reply);
                    res.redirect('/lobby');
                }
            });
        });
    });

    // Login url
    router.get('/login', isLoggedOut,(req,res) => {
        res.render('login');
    });

    // Logout url
    router.get('/logout',isLoggedIn,(req,res) => {
        req.logout();
        res.redirect("/")
    });

    //Lobby url
    router.get('/lobby',isLoggedIn,(req,res) => {
        res.render('lobby');
    });

    //Chatroom url
    router.get('/chatroom/:url',isLoggedIn, (req,res) => {
        ChatroomModel.findOne({
            where:{
                url : req.params.url
            }
        }).then((chatroom) => {
            res.render('chatroom', {chatroom : chatroom});
        }).catch(err => console.log(err));
    });

    router.get('/api/chatroom_list',isLoggedIn, (req,res) =>{
        UserModel.findOne({
            where: {
                facebookId: {
                    [Op.eq]: req.user.profile.id
                }
            },
            include: [
                {
                    model: ChatroomModel,
                    as: 'creates',
                    order: [
                        [ChatroomModel, 'createdAt', 'ASC']
                    ]
                },
                {
                    model: ChatroomModel,
                    as: 'invited',
                    order: [
                        [ChatroomModel, 'createdAt', 'ASC']
                    ]
                },
            ]
        }).then((user) => {

            let result = {};

            result.id = user.id;
            result.userName = user.userName;
            result.facebookId = user.facebookId;
            result.createdAt = user.createdAt;
            result.updatedAt = user.updatedAt;
            result.creates = user.creates.sort((a,b) => {
                return a.createdAt - b.createdAt;
            });

            result.invited = user.invited.filter(chatroom => {
                return chatroom.createdBy !== chatroom.userChatrooms.userId;
            }).sort((a,b) => {
                return a.createdAt - b.createdAt;
            });

            res.json(result);
        });
    });

    router.post('/api/create_chatroom',isLoggedIn, (req,res) =>{
        console.log(req.body);
        UserModel.findOne({
            where : {
                facebookId: {
                    [Op.eq]: req.user.profile.id
                }
            },
            attributes: ['id']
        }).then((user) => {
            let chatroom = new ChatroomModel();
            chatroom.createdBy = user.id;
            chatroom.chatroomName = req.body.chatroomName;
            chatroom.url = uuidv1();

            chatroom.save().then((chatroom)=>{
                let userChatroom = new UserChatroomModel();
                userChatroom.userId = user.id;
                userChatroom.chatroomId = chatroom.id;
                userChatroom.isJoin = true;

                userChatroom.save().then((userChatroom)=>{
                    let initMessageObj = {
                        username: req.user.profile.displayName,
                        userid: req.user.profile.id,
                        content: 'This is the first message. Enjoy!',
                        date: new Date().getTime()
                    };
                    client.rpush('message_list_for_'+ chatroom.url,JSON.stringify(initMessageObj),(err ,reply) => {
                        if(reply){
                            console.log(chatroom.url);
                            res.json(chatroom);
                        }
                    });
                }).catch(err => console.log(err));
            }).catch(err => console.log(err));
        });
    })

    router.get('/api/invite_user_list/:chatroom_id',isLoggedIn, (req,res) => {

        ChatroomModel.findOne({
            where : {
                id : {
                    [Op.eq]: req.params.chatroom_id
                }
            },
            attributes : ['id', 'createdBy']
        }).then((chatroom) => {
            UserChatroomModel.findAll({
                where: {
                    userId : {
                        [Op.ne]: chatroom.createdBy
                    },
                    chatroomId: {
                        [Op.ne]: chatroom.id
                    }
                },
            }).then((result) => {
                console.log();
                console.log(result);
                UserModel.findAll({
                    where: {
                        facebookId: {
                            [Op.ne]: req.user.profile.id
                        }
                    },
                    attributes: ['id', 'facebookId', 'userName']
                }).then(users =>{
                    res.json(users);
                }).catch(err => {
                    console.log(err);
                });
            })
        }).catch(err => {
            console.log(err);
        });
    });

    router.post('/api/invite_users/:chatroom_id',isLoggedIn, (req,res) => {

        //All ids for invited user
        let user_ids = req.body.users;

        user_ids.forEach((user_id)=>{
            UserChatroomModel.create({
                userId: user_id,
                chatroomId: req.params.chatroom_id,
                isJoin: false
            }).then((userChatroom)=>{
                console.log(userChatroom);
            }).catch((err) => {
                console.log(err);
            });
        })
    });

    router.get('*', (req, res) => {
        res.status(404).send('Page not found');
    });

    return router;
};