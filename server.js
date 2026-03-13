const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const io = new Server(PORT, {
  cors: { origin: "*" }
});

const users = {};

console.log("Chat server running on port", PORT);

io.on("connection", (socket) => {

  socket.on("join", (username) => {

    const name = String(username || "").trim();
    if (!name) return;

    socket.username = name;
    users[socket.id] = name;

    // notify others
    socket.broadcast.emit("user_joined", name);

  });

  socket.on("message", (msg) => {

    const text = String(msg || "").trim();

    // block blank messages
    if (!text) return;

    io.emit("message", {
      user: socket.username,
      text: text
    });

  });

  socket.on("get_users", () => {

    socket.emit("users_list", Object.values(users));

  });

  socket.on("disconnect", () => {

    const name = users[socket.id];

    if (!name) return;

    delete users[socket.id];

    socket.broadcast.emit("user_left", name);

  });

});