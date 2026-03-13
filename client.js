const io = require("socket.io-client");
const readline = require("readline");
const chalk = require("chalk");
const notifier = require("node-notifier");

const SERVER = "https://termino-5ajw.onrender.com";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let socket;
let username = "";

// username colors (no green)
const colors = [
  chalk.cyan,
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

  // highlight mentions
  if (text.includes("@" + username)) {
    console.log(chalk.bgYellow.black(`${user}: ${text}`));
  } else {
    console.log(color(user) + ": " + text);
  }

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

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);

    console.log(chalk.green("🔔 Connected to the server"));

    socket.emit("join", username);

  });

  socket.on("message", (data) => {

    printMessage(data.user, data.text);

    // mention notification
    if (
      data.text.includes("@" + username) &&
      data.user !== username
    ) {
      notifier.notify({
        title: `Mention from ${data.user}`,
        message: data.text,
        sound: true
      });
    }

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

  rl.setPrompt("> ");
  rl.prompt();

  rl.on("line", (input) => {

    const msg = input.trim();

    if (!msg) return;

    socket.emit("message", msg);

  });

});