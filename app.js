const express = require('express');
const hb = require('express-handlebars');
const bodyParser = require('body-parser');
const expressSession = require('express-session');



// User-defined Modules.
const app = express();
const server = require('http').Server(app);
const setupPassport = require('./passport');
const session = require('./session')
const io = require('./socket')(server);
const router = require('./router')(express);

app.engine('handlebars', hb({ 
    defaultLayout: 'main'
}));

//Import the environment configs
require('dotenv').config();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/bower_components',express.static(__dirname+'/bower_components'));


app.set('view engine', 'handlebars');

app.use(expressSession(session.settings));

setupPassport(app);

app.use('/', router);

server.listen(8080);