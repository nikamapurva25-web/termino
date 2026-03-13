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

// username colors
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

  socket.on("users_list", (users) => {

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log("\nOnline users:");

    users.forEach(u => console.log("- " + u));

    rl.prompt(true);

  });

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (input) => {

    const msg = input.trim();

    if (!msg) return;

    if (msg === "/users") {
      socket.emit("get_users");
      return;
    }

    socket.emit("message", msg);

  });

});