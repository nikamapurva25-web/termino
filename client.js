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