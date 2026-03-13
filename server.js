const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const io = new Server(PORT, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {

  socket.on("join", (username) => {

    const name = String(username || "").trim();
    if (!name) return;

    socket.username = name;

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

});