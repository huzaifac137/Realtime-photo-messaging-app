const express = require("express");
const app = express();

const http = require("http");
const { Server } = require("socket.io");

const serverr = http.createServer(app);

const io = new Server(serverr, {
  cors: {
    origin: true,
    methods: ["GET", "POST"],
  },
});

let users = [];

const addUser = (newUser) => {
  users.some((user) => user.socketId === newUser.socketId) === false &&
    users.push(newUser);
};

const getUsers = (socketId) => {
  return users.filter((user) => user.socketId !== socketId);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  console.log("USER XONNECTED WITH ID : " + socket.id);

  socket.on("add-user", (NAME) => {
    addUser({ name: NAME, socketId: socket.id });
    console.log(users);
  });

  socket.on("sendImg", (data) => {
    const img = data.image.toString("base64");
    console.log(img);
    const user = getUsers(socket.id);
    console.log(user);
    console.log("  ");
    console.log("  ");

    if (user) {
      for (let i = 0; i < user.length; i++) {
        io.to(user[i].socketId).emit("recieveImg", {
          name: data.name,
          image: img,
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
  });
});

serverr.listen(5000, () => {
  console.log("connected to port 5000");
});
