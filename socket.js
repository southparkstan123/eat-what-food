const session = require("./session");
const socketIOSession = require("socket.io.session");
const client = require('./database');

module.exports = (server)=>{
    const io = require('socket.io')(server);
    
    //"sessionSettings" same config as http-session used 
    //const socketSession = socketIOSession(session.settings); 
    
    //io.use(socketSession.parser);

    // io.use((socket, next)=>{
    //     if(!socket.session.passport){
    //         socket.disconnect();
    //     }else{
    //         next();
    //     }
    // });
    
    io.on('connection',(socket)=>{
        //socket.session.passport
        // socket.emit('show_who_logged_in',socket.session.passport.user);

        socket.on('load_messages_from_redis', () => {
            client.lrange('message_list',0, -1, (err, reply)=>{
                if(reply){
                    let message_list = reply.map((message) => {
                        return JSON.parse(message);
                    })
                    socket.emit('display_all_messages', message_list);
                }
            });
        });

        socket.on('send_message',(content)=>{
            let messageObj = {
                username: 'Dickson Wong',//socket.session.passport.user
                userid: '167',//socket.session.passport.id
                content: content,
                date: new Date().getTime()
            };
    
            client.rpush('message_list', JSON.stringify(messageObj) , (err, reply)=>{
                if(reply){
                    console.log('message saved');
                    socket.emit('display_sent_message', messageObj);
                }
            });
        });
    });

    return io;
}