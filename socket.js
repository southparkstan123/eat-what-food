const session = require('./session')
const socketIOSession = require("socket.io.session");
const client =require('./database');
const db = require('./models/index');
const date_vote_models =require('./models').voteDates;
var pg = require('pg');

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



            let data=[{
                date:'testing date',
                percent_of_people:60,
                voted:'checked'
            },{
                date:'testing date 2',
                percent_of_people:50,
                voted:null
            }];
            io.emit('date_table_updated',data);
        })
    });

    io.on('send_message',(socket)=>{
        socket.emit('print_message',socket.session.passport.user);
    })

    
    return io;
}