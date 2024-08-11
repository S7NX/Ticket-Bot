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
    await handleCommandError(client, interaction, error);
  }
};

// Helper function to handle command execution errors
async function handleCommandError(client, interaction, error) {
  console.error(chalk.red(`Error executing command ${interaction.commandName}:`), error);

  const errorEmbed = createErrorEmbed(interaction.commandName, error);

  // Send error details to a specific error channel if configured
  if (errorChannel) {
    const logChannel = client.channels.cache.get(errorChannel);
    if (logChannel) {
      await logChannel.send({ embeds: [errorEmbed] });
    }
  }

  // Send error details to the interaction channel
  await interaction.channel.send({ embeds: [errorEmbed] });
}

// Helper function to create a standardized error embed
function createErrorEmbed(commandName, error) {
  return new EmbedBuilder()
    .setTitle('Command Execution Error')
    .setDescription(`An error occurred while executing the command \`${commandName}\`.\n\n\`\`\`xl\n${error.stack}\n\`\`\``)
    .setColor('RED')
    .setTimestamp();
}