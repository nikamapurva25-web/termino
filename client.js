const io = require("socket.io-client");
const readline = require("readline");
const chalk = require("chalk");

const SERVER = "https://terminal-chat-730t.onrender.com";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let socket;
let username = "";

// username color palette
const colors = [
  chalk.cyan,
  chalk.green,
  chalk.magenta,
  chalk.blue,
  chalk.yellow,
  chalk.red
];

const userColors = {};
let colorIndex = 0;

function getColor(user) {
  if (!userColors[user]) {
    userColors[user] = colors[colorIndex % colors.length];
    colorIndex++;
  }
  return userColors[user];
}

function printMessage(user, text) {

  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);

  const color = getColor(user);

  console.log(color(user) + ": " + text);

  rl.prompt(true);
}

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
  });

  socket.on("message", (data) => {
    printMessage(data.user, data.text);
  });

  socket.on("error_message", (msg) => {
    console.log(msg);
    process.exit(1);
  });

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (input) => {

    const msg = input.trim();

    // block blank messages
    if (!msg) return;

    socket.emit("message", msg);

  });

});