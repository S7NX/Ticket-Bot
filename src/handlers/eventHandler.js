const path = require("path");
const getAllFiles = require("../utils/getAllFiles");
const { errorChannel } = require("../../config.json");
const { EmbedBuilder } = require('discord.js');

module.exports = async (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, "..", "events"), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);
    eventFiles.sort();

    const eventName = getEventNameFromFolder(eventFolder);

    client.on(eventName, async (arg) => {
      try {
        await executeEventHandlers(client, eventFiles, arg);
      } catch (error) {
        await handleEventError(client, error);
      }
    });
  }
};

// Helper function to get the event name from the folder path
function getEventNameFromFolder(eventFolder) {
  return eventFolder.replace(/\\/g, "/").split("/").pop();
}

// Helper function to execute all event handlers for a given event
async function executeEventHandlers(client, eventFiles, arg) {
  for (const eventFile of eventFiles) {
    const eventFunction = require(eventFile);
    await eventFunction(client, arg);
  }
}

// Helper function to handle errors during event execution
async function handleEventError(client, error) {
  console.error(`Error executing event:`, error);

  if (!errorChannel || errorChannel.length < 1) return;

  const channel = client.channels.cache.get(errorChannel);
  if (channel) {
    const errorEmbed = createErrorEmbed(error);
    await channel.send({ embeds: [errorEmbed] });
  }
}

// Helper function to create a standardized error embed
function createErrorEmbed(error) {
  return new EmbedBuilder()
    .setTitle('Event Execution Error')
    .setDescription(`An error occurred during the execution of an event.\n\n\`\`\`xl\n${error.stack}\n\`\`\``)
    .setColor('RED')
    .setTimestamp();
}