var app     =  require("express")();
var http    =  require('http').Server(app);
var io      =  require("socket.io")(http);
var mongoose = require("mongoose");


/*Creating Schema and Models for DB*/
var Schema = mongoose.Schema;

var MessageSchema = new Schema({s_text: String});

var Message = mongoose.model('Message', MessageSchema)

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost/chat",
    {
      useMongoClient: true
    }
  );

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
    console.log("Mongoose Connected")
});

app.get("/",function(req,res){
    res.sendFile(__dirname + '/index.html');
});

/*  This is auto initiated event when Client connects to Your Machien.  */

io.on('connection',function(socket){  
    console.log("A user is connected");
    socket.on('status added',function(status){
      add_status(status,function(res){
        if(res){
            io.emit('refresh feed',status);
        } else {
            io.emit('error');
        }
      });
    });
    socket.on('disconnect', function(){
        console.log("A user has disconnected")
    })
});

var add_status = function (status,callback) {
    Message.create({s_text: status},function(err){
            if(!err) {
              callback(true);
            }
        });
    };

http.listen(3000,function(){
    console.log("Listening on 3000");
});
