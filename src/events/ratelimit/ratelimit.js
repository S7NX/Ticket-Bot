<<<<<<< HEAD
const fs = require("fs");
const chalk = require("chalk");
module.exports = async (client, rateLimitData) => {
  const logMessage = JSON.stringify(rateLimitData);
  console.log(chalk.grey(logMessage));

  // Append the log message to the file
  fs.appendFile("rateLimitLog.txt", logMessage + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    } else {
      console.log("Logged rate limit data to file:", filePath);
    }
  });
};
=======
const fs = require("fs");
const chalk = require("chalk");
module.exports = async (client, rateLimitData) => {
  const logMessage = JSON.stringify(rateLimitData);
  console.log(chalk.grey(logMessage));

  // Append the log message to the file
  fs.appendFile("rateLimitLog.txt", logMessage + "\n", (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    } else {
      console.log("Logged rate limit data to file:", filePath);
    }
  });
};
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
