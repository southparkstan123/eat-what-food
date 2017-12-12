const express = require('express');
const app = express();
const http = require('http').Server(app);
const passport = require('passport');

module.exports = (express) => {
    const router = express.Router();

    router.get('/',(req,res) =>{
        res.render('partials/chatroom');
    })
    
    router.get('*', function(req, res){
        res.status(404).send('Page not found');
    });

    return router;
};