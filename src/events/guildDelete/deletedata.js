<<<<<<< HEAD
const { Client, Guild } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const TicketInfo = require('../../models/GuildTicket');

/**
 *
 * @param {Client} client
 * @param {Guild} guild
 */
module.exports = async (client, guild) => {
	try {
		const guildId = guild.id;
		if (!guildId) return;

		const guildSettings = await GuildSettings.findOne({ guildId });
		if (!guildSettings) return;
		// Remove the guild settings from the database
		await guildSettings.deleteOne();

		const ticketInfo = await TicketInfo.findOne({ guildId });
		if (!ticketInfo) return;
		// Remove the ticket info from the database
		await ticketInfo.deleteOne();

	} catch (error) {
		console.log(`Error Deleting Guild Data automatically: ${error}`);
	}
};
=======
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
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
