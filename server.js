const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const io = new Server(PORT, {
  cors: { origin: "*" }
});

const users = {}; // socket.id -> username

console.log("Chat server running on port", PORT);

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on("join", (username) => {
    const name = String(username || "").trim();
    if (!name) return;

    socket.username = name;
    users[socket.id] = name;

    console.log("user joined:", name);

    // notify everyone else
    socket.broadcast.emit("user_joined", name);
  });

  socket.on("message", (msg) => {
    const text = String(msg || "").trim();
    if (!text) return;

    io.emit("message", {
      user: socket.username,
      text
    });
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    if (!name) return;

    delete users[socket.id];
    console.log("user left:", name);

    socket.broadcast.emit("user_left", name);
  });
});