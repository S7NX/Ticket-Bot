const { errorChannel } = require("../../../config.json");
const chalk = require("chalk");
const { EmbedBuilder } = require('discord.js');
const getLocalCommands = require("../../utils/getLocalCommands");

module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(chalk.yellow(`No command matching ${interaction.commandName} was found.`));
    return;
  }

  try {
    await command.execute(client, interaction);
  } catch (error) {
      await handleCommandError(interaction, error);
  }

};



