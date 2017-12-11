const express = require('express');
const app = express();
const hb = require('express-handlebars');
const bodyParser = require('body-parser');

app.engine('handlebars', hb({ 
    defaultLayout: 'main'
}));

//Import the environment configs
require('dotenv').config();

// Middlewares
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/bower_components',express.static(__dirname+'/bower_components'));

app.get('/',(req,res) =>{
    res.render('partials/chatroom');
})

app.get('*', function(req, res){
    res.status(404).send('Page not found');
});

app.set('view engine', 'handlebars');
app.listen(8080);