const chalk = require("chalk");
module.exports = (client, error) => {
  console.log(chalk.yellow(String(error)));
};
