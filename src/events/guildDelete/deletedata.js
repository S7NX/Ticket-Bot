const { Client, Guild } = require("discord.js");
const GuildSettings = require("../../models/GuildSettings");
const UserSettings = require("../../models/UserSettings");

/**
 *
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
  try {
    const guildId = guild.id;
    if (!guildId) return;
    console.log(`I have left the guild ${guild.name}`);

    const guildSettings = await GuildSettings.findOne({ guildId });
    if (!guildSettings) return;
    const { partner, desc, lastBumpDate } = guildSettings;
    // Remove the guild settings from the database
    await GuildSettings.deleteMany({
      guildId,
      partner,
      desc,
      lastBumpDate,
    }).catch((error) => {
      console.log(error);
    });
    console.log("Deleted Guild DB");
    const userSettings = await UserSettings.findOne({ guildId });
    if (!userSettings) return;
    const { userId, bumps } = userSettings;
    await UserSettings.deleteMany({ guildId, userId, bumps }).catch((error) => {
      console.log(error);
    });
    console.log("Deleted User DB");
  } catch (error) {
    console.log(`Error Deleting Guild Data automatically: ${error}`);
  }
};
