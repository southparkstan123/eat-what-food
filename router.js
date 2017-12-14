const express = require('express');
const app = express();
const http = require('http').Server(app);
const passport = require('passport');
const client = require('./database');

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

        let userObj = {
            userID : req.user.profile.id,
            username : req.user.profile.displayName
        };

        client.rpush('online_user_list', JSON.stringify(userObj), (err, reply) =>{
            if(reply){
                console.log(reply);
                res.redirect('/lobby');
            }
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
    router.get('/chatroom',isLoggedIn, (req,res) => {
        res.render('chatroom');
    })
    
    router.get('*', (req, res) => {
        res.status(404).send('Page not found');
    });

    return router;
};