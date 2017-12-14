const session = require('./session')
const socketIOSession = require("socket.io.session");
const client =require('./database');
const db = require('./models/index');


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
            io.emit('date_created',date)
        });
        socket.on('vote_change',(choice)=>{
            if(choice == 'join'){
                db
            }else if(choice == 'no_join'){

            }
        })

    });

    io.on('send_message',(socket)=>{
        socket.emit('print_message',socket.session.passport.user);
    })

    
    return io;
}