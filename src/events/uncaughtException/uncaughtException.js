const chalk = require("chalk");

module.exports = (client, error ) => {
    console.log(chalk.red.bold("Uncaught Exception:"), error);
};
