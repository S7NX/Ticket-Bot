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
