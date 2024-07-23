<<<<<<< HEAD
const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const chalk = require("chalk");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.log(chalk.red("There was an error: "), error, "\n");
  }
};
=======
const { devs, testServer } = require("../../../config.json");
const getLocalCommands = require("../../utils/getLocalCommands");
const chalk = require("chalk");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(client, interaction);
  } catch (error) {
    console.log(chalk.red("There was an error: "), error, "\n");
  }
};
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
