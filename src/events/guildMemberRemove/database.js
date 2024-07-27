const { Client, Guild } = require("discord.js");
const GuildSettings = require("../../models/UserSettings");

/**
 *
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, member) => {
  try {
    const guildSettings = await GuildSettings.findOne({
      guildId: member.guild.id,
    });
    if (!guildSettings) return;
    await guildSettings.deleteOne();
    console.log("Deleted GuildSettings");
  } catch (error) {
    console.log(`Error Deleting User Data automatically: ${error}`);
  }
};
