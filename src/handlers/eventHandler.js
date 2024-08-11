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
        await client.handleError(interaction, error)
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

