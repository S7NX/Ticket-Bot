const chalk = require("chalk");

module.exports = (client, reason, promise ) => {
    console.log(chalk.red.bold("Unhandled Rejection at:"), promise);
    console.log(chalk.red("Reason:"), reason);
};
