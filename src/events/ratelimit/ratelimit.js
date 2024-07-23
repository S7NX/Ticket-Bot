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
