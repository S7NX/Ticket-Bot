const chalk = require("chalk");
module.exports = (client, info) => {
  console.log(chalk.grey(String(info)));
};
