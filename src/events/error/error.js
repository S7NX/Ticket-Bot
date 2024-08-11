const chalk = require("chalk");
module.exports = async (client, error) => {
  console.log(chalk.red(String(error.stack)));
};
