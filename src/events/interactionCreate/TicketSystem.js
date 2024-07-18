const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const GuildTicketSchema = require('../../models/GuildTicket');

module.exports = async (client, interaction) => {
	if (interaction.isStringSelectMenu()) {
		let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
		if (!guildSettings) return;

		// Extract the values from TicketMenuOptions for comparison
		const ticketMenuValues = guildSettings.TicketMenuOptions.map((option) => option.value);

		if (!ticketMenuValues.includes(interaction.values[0])) {
			return interaction.reply({ content: 'Invalid Ticket Menu Option', ephemeral: true });
		}
		const ticketOption = guildSettings.TicketMenuOptions.find((option) => option.value === interaction.values[0]);
		createTicket(interaction, guildSettings, guildSettings.StaffRoleIDs, ticketOption);
	} else if (interaction.isButton()) {
        if (interaction.customId === 'ticket-close') {
            
        }
    }
};

async function createTicket(interaction, guildSettings, ticket_support_roles, ticketOption) {
	try {
		let orderId = guildSettings.CurrentTicketChannelNumber++;
		await guildSettings.save();

		let ticketName = `${orderId}-${ticketOption.label}-${interaction.user.username}`.toLowerCase();
		let supportRoles = ticket_support_roles.map((x) => ({
			id: x,
			allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages],
		}));

		await interaction.reply({ content: `Creating ticket...`, ephemeral: true });

		if (interaction.guild.channels.cache.find((c) => c.topic == interaction.user.id && c.name.includes(ticketOption))) {
			return interaction.editReply({ content: `You already have a ticket: <#${c.id}>`, ephemeral: true });
		}

		const createdChannel = await interaction.guild.channels.create({
			name: ticketName,
			type: ChannelType.GuildText,
			topic: `${interaction.user.id}`,
			parent: ticketOption.Category || guildSettings.TicketCategory,
			permissionOverwrites: [
				{
					allow: [PermissionsBitField.Flags.ViewChannel],
					deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks],
					id: interaction.user.id,
				},
				{
					deny: PermissionsBitField.Flags.ViewChannel,
					id: interaction.guild.id,
				},
				...supportRoles,
			],
		});

		await GuildTicketSchema.create({
			ticketID: orderId,
			TicketChannelId: createdChannel.id,
			guildId: interaction.guild.id,
			ticketUserID: interaction.user.id,
		});

		await interaction.editReply({ content: `Ticket created successfully in ${createdChannel}!`, ephemeral: true });

		setTimeout(async () => {
			await interaction.deleteReply();
		}, 60000);

		const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('🔒').setCustomId('ticket-close'), new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji('🗑️').setCustomId('ticket-delete'));

		const embed = new EmbedBuilder()
			.setDescription(`# Ticket: ${ticketOption.label} \n\n> ## by: <@!${interaction.user.id}>`)
			.setColor(guildSettings.EmbedOptions.color || 'Aqua')
			.setImage(guildSettings.EmbedOptions.image || null)
			.setFooter(guildSettings.EmbedOptions.footer || null);

		// Find the staff role with the most members
		let mostMembersRole;
		let maxMembers = 0;

		for (let roleId of guildSettings.StaffRoleIDs) {
			const role = interaction.guild.roles.cache.get(roleId);
			if (role && role.members.size > maxMembers) {
				maxMembers = role.members.size;
				mostMembersRole = role;
			}
		}

		let mentionString = `${ticket_support_roles.map((m) => `<@&${m}>`).join(', ')}`;
		if (mostMembersRole) {
			mentionString = `<@&${mostMembersRole.id}>`;
		}

		await createdChannel.send({
			content: `${mentionString}. New Ticket!`,
			embeds: [embed],
			components: [row],
		});
	} catch (error) {
		console.error('Error creating ticket:', error);
		await interaction.reply({ content: `An error occurred while creating the ticket. Please try again later.`, ephemeral: true });
	}
}
