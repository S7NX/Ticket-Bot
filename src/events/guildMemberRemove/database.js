const { Client, Guild } = require("discord.js");
const UserSettings = require("../../models/UserSettings");

/**
 *
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, member) => {
  try {
    const userSettings = await UserSettings.findOne({
      guildId: member.guild.id,
      userId: member.id,
    });
    if (!userSettings) return;
    const { guildId, userId, bumps, warns } = userSettings;
    await UserSettings.deleteMany({ guildId, userId, bumps, warns }).catch(
      (error) => {
        console.log(error);
      },
    );
    console.log("Deleted User DB");
  } catch (error) {
    console.log(`Error Deleting User Data automatically: ${error}`);
  }
};
