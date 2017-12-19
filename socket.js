const session = require('./session')
const socketIOSession = require("socket.io.session");
const db = require('./models/index');
const date_vote_models =require('./models').voteDates;
var pg = require('pg');
const Sequelize = require('sequelize');
const connection = new Sequelize('eat-what-food', 'alan', 'asdfghjkl', {
    dialect: 'postgres'
});

var config = {
    user: 'alan',
    database: 'eat-what-food',
    password: 'asdfghjkl',
    host: 'localhost',
    port: 5432,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
}
var client = new pg.Client(config);

client.connect();
connection
    .authenticate()
    .then(() => {
        console.log('Connection has been established successfully.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

module.exports = (server)=>{
    const io = require('socket.io')(server);
    
    //"sessionSettings" same config as http-session used 
    const socketSession = socketIOSession(session.settings); 
    
    io.use(socketSession.parser);

    /*io.use((socket, next)=>{
        if(!socket.session.passport){
            socket.disconnect();
        }else{
            next();
        }
    });*/
    
    io.on('connection',(socket)=>{
        //socket.emit('username',socket.session.passport.user);
        socket.on('date_created',(date)=>{

            //date = 1513672800
            //
            let data=[{
                date:'testing date',
                percent_of_people:60
            },{
                date:'testing date 2',
                percent_of_people:50
            }];
            io.emit('date_table_updated',data)
        });
        socket.on('date_vote_increase',()=>{

            let data=[{
                date:'testing date',
                percent_of_people:60,
                voted:'checked'
            },{
                date:'testing date 2',
                percent_of_people:50,
                voted:null
            }];
            data[0].percent_of_people +=10
            io.emit('date_process_bar_increase',data)
        })
        socket.on('date_vote_decrease',()=>{
            let data=[{
                date:'testing date',
                percent_of_people:60,
                voted:'checked'
            },{
                date:'testing date 2',
                percent_of_people:50,
                voted:null
            }];
            data[0].percent_of_people -=10
            io.emit('date_process_bar_increase',data)
        })
        socket.on('page_loaded',()=>{
            let chat_url ='abc123';
            let findUserInfo =(chat_url)=>{ 
                return new Promise((resolve,reject)=>{
                    client.query(`SELECT DISTINCT vd.date
                    FROM chatrooms AS cr
                    INNER JOIN "userChatrooms" AS uc on cr.id = uc."chatroomId"
                    INNER JOIN "voteDates" AS vd on vd."userChatroomId" = uc.id
                    where cr.url = '${chat_url}';`,(err,results)=>{
                        if(err){reject(err)}
                        else {
                            resolve(results.rows)};
                    })
                })
            }
            findUserInfo(chat_url).then((data)=>{
                let output=[];
                for(let i=0;i<data.length;i++){
                    output.push({
                        date: data[i].date
                    })
                }
                console.log(output);
                io.emit('date_table_updated',output);
            });
        })
    });

    io.on('send_message',(socket)=>{
        socket.emit('print_message',socket.session.passport.user);
    })

    
    return io;
}