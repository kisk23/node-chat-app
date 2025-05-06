const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const http = require("http");
const { generateMessage } = require("./utils/messages");
const {addUser, removeUser, getUser, getUsersInRoom} = require("./utils/users")



const port = process.env.PORT||3000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

io.on("connection", (socket) => {
  console.log("connection succeed");

  // socket.emit("welcomeMessage", generateMessage("welcome from the server"));

  // socket.broadcast.emit("welcomeMessage", generateMessage("a new user has joined"));

  socket.on("sendMessage", (message, callBack) => {
    const user = getUser(socket.id);
    if(user) {
    io.to(user.room).emit("welcomeMessage", generateMessage(user.username,message));}
    callBack(" delivered ");
  });


  socket.on("sendLocation", (location,acknowledgeCallback) => {
    const user = getUser(socket.id);
    if(user) {
      io.to(user.room).emit("welcomeMessage", generateMessage(user.username,`https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
    }
    
    acknowledgeCallback("from the server")
   
  });
  socket.on("join", ({ username, room },callBack) => {

    const {user,error} =addUser({ id: socket.id, username, room });
    if(error) {
       return callBack(error);
    }
    socket.join(user.room);
    socket.emit("welcomeMessage", generateMessage(user.username,`welcome ${user.username} to the room ${user.room}`));
    socket.broadcast.to(room).emit("welcomeMessage", generateMessage(user.username,`${user.username} has joined`));
io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });


    callBack();
   
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if(user) {
      
      io.to(user.room).emit("welcomeMessage", generateMessage(user.username,`${user.username} has left the chat .`));
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
   
  });
});


server.listen(port, () => {
  console.log("Server is up on port " + port);
});
