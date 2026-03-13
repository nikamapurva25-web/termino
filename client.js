const io = require("socket.io-client");
const readline = require("readline");
const chalk = require("chalk");

const SERVER = "https://termino-5ajw.onrender.com";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let socket;
let username = "";

rl.question("Username: ", (name) => {
  username = name.trim();

  if (!username) {
    console.log("Username required");
    process.exit();
  }

  socket = io(SERVER);

  socket.on("connect", () => {
    console.log(chalk.green("🔔 Connected to the server"));
    socket.emit("join", username);
    rl.setPrompt("> ");
    rl.prompt();
  });

  socket.on("message", (data) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(`${data.user}: ${data.text}`);
    rl.prompt(true);
  });

  socket.on("user_joined", (user) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(chalk.green(`🔔 ${user} connected to the server`));
    rl.prompt(true);
  });

  socket.on("user_left", (user) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    console.log(chalk.red(`❌ ${user} left the server`));
    rl.prompt(true);
  });

  rl.on("line", (input) => {
    const msg = input.trim();
    if (!msg) return; // block blanks
    socket.emit("message", msg);
  });
});