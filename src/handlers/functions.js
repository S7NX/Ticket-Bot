const chalk = require('chalk');
const { EmbedBuilder } = require('discord.js');
const { errorChannel } = require('../../config.json');
module.exports = {
  nFormatter,
  handleError,
};




async function handleError(client, interaction, error) {
  let errorEmbed = new EmbedBuilder()
  .setTitle('⚠️ Execution Error')
  .setDescription(`An unexpected error occurred.`)
  .setColor('Red')
  .setFooter({ text: `User ID: ${interaction.user.id}` })
  .setTimestamp();

// Handle command errors
if (interaction.commandName) {
  console.error(chalk.red(`Error executing command ${interaction.commandName}:`), error);

  errorEmbed.setTitle('⚠️ Command Execution Error')
    .setDescription(`An unexpected error occurred while executing the command ${interaction.commandName}.`)
    .addFields(
      { name: 'Command', value: interaction.commandName, inline: true },
      { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Error Message', value: `\`\`\`xl\n${error.message}\n\`\`\`` }
    );

  // Add stack trace if available
  if (error.stack) {
    errorEmbed.addFields(
      { name: 'Stack Trace', value: `\`\`\`xl\n${error.stack.slice(0, 1024)}\n\`\`\`` } // Truncate to fit Discord's limit
    );
  }
} else {
  console.error(chalk.red(`Error occurred during an event:`), error);

  // Adjust errorEmbed for event errors
  errorEmbed.setTitle('⚠️ Event Error')
    .setDescription('An unexpected error occurred during an event.')
    .addFields(
      { name: 'User', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Error Message', value: `\`\`\`xl\n${error.message}\n\`\`\`` }
    );

  // Add stack trace if available
  if (error.stack) {
    errorEmbed.addFields(
      { name: 'Stack Trace', value: `\`\`\`xl\n${error.stack.slice(0, 1024)}\n\`\`\`` } // Truncate to fit Discord's limit
    );
  }
}

// Send error to the designated log channel if available
if (errorChannel) {
  const logChannel = client.channels.cache.get(errorChannel);
  if (logChannel) {
    await logChannel.send({ embeds: [errorEmbed] });
  }
}

if (!interaction) return;
// Reply to the interaction or event
if (interaction.replied || interaction.deferred) {
  await interaction.editReply({ content: 'There was an error.'});
} else {
  await interaction.reply({ content: 'There was an error.', ephemeral: true, });
}
}




function nFormatter(num, digits) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const i = si.findIndex((x) => num < x.value);

  return (
    (num / si[i - 1].value).toFixed(digits).replace(rx, "$1") + si[i - 1].symbol
  );
}
