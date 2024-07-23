<<<<<<< HEAD
const chalk = require("chalk");
const mongoose = require("mongoose");

module.exports = async (client) => {
  mongoose.set("strictQuery", false);

  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI)
    return console.log(chalk.red("🍃 Mongo URI not found, skipping."));

  mongoose.connect(MONGO_URI);

  mongoose.connection.on("error", (error) => {
    console.log(chalk.red(`🍃 MongoDB connection error: ${error}`));
    console.log(chalk.red("🍃 Retrying in 8 seconds..."));
    setTimeout(() => {
      mongoose.connect(MONGO_URI);
    }, 8000);
  });
  mongoose.connection.once("open", () => {
    console.log(chalk.green(`${client.user.tag} is online.`));
    console.log(chalk.green("🍃 MongoDB connection has been established."));
  });
};
=======
const chalk = require("chalk");
const mongoose = require("mongoose");

module.exports = async (client) => {
  mongoose.set("strictQuery", false);

  const MONGO_URI = process.env.MONGODB_URI;
  if (!MONGO_URI)
    return console.log(chalk.red("🍃 Mongo URI not found, skipping."));

  mongoose.connect(MONGO_URI);

  mongoose.connection.on("error", (error) => {
    console.log(chalk.red(`🍃 MongoDB connection error: ${error}`));
    console.log(chalk.red("🍃 Retrying in 8 seconds..."));
    setTimeout(() => {
      mongoose.connect(MONGO_URI);
    }, 8000);
  });
  mongoose.connection.once("open", () => {
    console.log(chalk.green(`${client.user.tag} is online.`));
    console.log(chalk.green("🍃 MongoDB connection has been established."));
  });
};
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
