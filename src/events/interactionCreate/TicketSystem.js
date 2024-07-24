const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const GuildTicketSchema = require('../../models/GuildTicket');
const discordTranscripts = require('discord-html-transcripts');
const fetch = require('node-fetch-commonjs');

module.exports = async (client, interaction) => {
	try {
		if (interaction.isStringSelectMenu()) {
			let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
			if (!guildSettings) return;

			// Extract the values from TicketMenuOptions for comparison
			const ticketMenuValues = guildSettings.TicketMenuOptions.map((option) => option.value);

			if (!ticketMenuValues.includes(interaction.values[0])) {
				return interaction.reply({ content: 'Invalid Ticket Menu Option', ephemeral: true });
			}
			const ticketOption = guildSettings.TicketMenuOptions.find((option) => option.value === interaction.values[0]);
			let intmsg = interaction.message;
			intmsg.edit({ embeds: [EmbedBuilder.from(intmsg.embeds[0])], components: [ActionRowBuilder.from(intmsg.components[0])] });
			createTicket(interaction, guildSettings, guildSettings.StaffRoleIDs, ticketOption);
		} else if (interaction.isButton()) {
			if (interaction.customId === 'ticket-close') {
				const confirm = new ButtonBuilder().setCustomId('close_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
				const cancel = new ButtonBuilder().setCustomId('close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);

				const row = new ActionRowBuilder().addComponents(confirm, cancel);

				let reply = interaction.reply({ content: 'Are you sure you want to close this ticket?', components: [row] });
			} else if (interaction.customId === 'close_confirm') {
				const channel = interaction.channel;
				const parentId = channel.parent.id || null;

				const [guildSettings, ticketInfo] = await Promise.all([GuildSettings.findOne({ guildId: interaction.guild.id }), GuildTicketSchema.findOne({ TicketChannelId: channel.id })]);

				await interaction.message.delete();
				const member = interaction.guild.members.cache.get(ticketInfo.ticketUserID);
				const logChannel = interaction.guild.channels.cache.get(guildSettings.TicketLogChannelID);
				const embedMessage = await channel.messages.fetch(ticketInfo.TicketEmbedMsgId);

				const [closeButton, deleteButton, claimButton] = embedMessage.components[0].components;
				const disabledCloseButton = ButtonBuilder.from(closeButton).setDisabled(true);

				await embedMessage.edit({
					components: [new ActionRowBuilder().addComponents(disabledCloseButton, deleteButton, claimButton)],
				});

				await channel.permissionOverwrites.edit(member, {
					[PermissionsBitField.Flags.ViewChannel]: false,
				});

				const orderId = ticketInfo.ticketID;
				await channel.edit({
					name: `${orderId}-closed-${member.user.username}`,
					parent: guildSettings.ClosedTicketCategory || parentId,
				});


				
				const StringTranscript = await discordTranscripts.createTranscript(channel, {
					poweredBy: false,
					saveImages: true,
					returnType: 'string',
				});
				const uniqueCode = `${Date.now().toString(36)+Math.random().toString(36).substring(2, 10)}`
				let url = await saveHtml( 'https://s7nx.is-a-awesome.dev', uniqueCode, StringTranscript)
				const transcriptButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Transcript').setURL(url);
				
				const ticketClosedEmbed = new EmbedBuilder().setDescription(`## Ticket Closed \n> ### ***Ticket ID: ${orderId} :arrow_right: 🔒 Closed*** \n### Ticket System.`);

				const reopenButton = new ButtonBuilder().setLabel('Reopen Ticket!').setStyle(ButtonStyle.Secondary).setCustomId('reopen_ticket');

				const actionRow = new ActionRowBuilder().addComponents( transcriptButton, reopenButton);

				await interaction.channel.send({
					content: '## Ticket Closed.',
					embeds: [ticketClosedEmbed],
					components: [ new ActionRowBuilder().addComponents(transcriptButton)],
				});

				const logMessage = await logChannel.send({
					embeds: [ticketClosedEmbed],
					components: [actionRow],
				});

				const memberEmbed = new EmbedBuilder().setDescription(`## ${interaction.guild.name} \n### Your Ticket has been Closed.\n> ### ***Ticket ID: ${orderId} :arrow_right: 🔒 Closed*** \n### Ticket System.`);

				await member.send({
					embeds: [memberEmbed],
					components: [ new ActionRowBuilder().addComponents(transcriptButton)],
				});

				ticketInfo.logMessageId = logMessage.id;
				ticketInfo.TicketStatus = 'Closed';
				await ticketInfo.save();
			} else if (interaction.customId === 'close_cancel' || interaction.customId === 'delete_cancel') {
				await interaction.message.delete();
			} else if (interaction.customId === 'ticket-delete') {
				const confirm = new ButtonBuilder().setCustomId('delete_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
				const cancel = new ButtonBuilder().setCustomId('delete_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
				const row = new ActionRowBuilder().addComponents(confirm, cancel);

				interaction.reply({ content: 'Are you sure you want to delete this ticket?', components: [row] });
			} else if (interaction.customId === 'delete_confirm') {
				const channel = interaction.channel;
				const member = interaction.guild.members.cache.get(channel.topic);
				const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				const logChannel = interaction.guild.channels.cache.get(guildSettings.TicketLogChannelID);
				const ticketInfo = await GuildTicketSchema.findOne({ TicketChannelId: channel.id });
				const orderId = ticketInfo.ticketID;

				await interaction.reply({
					content: '## Ticket Deleted.',
				});

				const embed = new EmbedBuilder().setDescription(`## ${interaction.guild.name} \n### Your Ticket has been Deleted.\n> ### ***Ticket ID: ${orderId} :arrow_right: 🗑️ Deleted*** \n### Ticket System.`);

				const transcript = await discordTranscripts.createTranscript(channel);
				await channel.delete();

				if (ticketInfo.TicketStatus !== 'Closed') {
					await member.send({ embeds: [embed], files: [transcript] });
				}

				const logEmbed = new EmbedBuilder().setDescription(`## Ticket Deleted \n> ### ***Ticket ID: ${orderId} :arrow_right: 🗑️ Deleted*** \n### Ticket System.`);
				await logChannel.send({ embeds: [logEmbed], files: [transcript] });

				await ticketInfo.deleteOne();
			} else if (interaction.customId === 'ticket-claim') {
				const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				const ticketInfo = await GuildTicketSchema.findOne({ TicketChannelId: interaction.channel.id });

				if (!interaction.member.roles.cache.some((role) => guildSettings.StaffRoleIDs.includes(role.id)) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
					return interaction.reply({ content: 'You do not have permission to claim this ticket.', ephemeral: true });
				}

				if (ticketInfo.claimUserId) {
					return interaction.reply({ content: 'This ticket is already claimed.', ephemeral: true });
				}

				const embedMessage = await interaction.channel.messages.fetch(ticketInfo.TicketEmbedMsgId);

				const [closeButton, deleteButton, claimButton] = embedMessage.components[0].components;
				const disabledClaimButton = ButtonBuilder.from(claimButton).setDisabled(true);

				await embedMessage.edit({
					components: [new ActionRowBuilder().addComponents(closeButton, deleteButton, disabledClaimButton)],
				});

				await interaction.channel.permissionOverwrites.edit(interaction.member, {
					[PermissionsBitField.Flags.SendMessages]: true,
					[PermissionsBitField.Flags.AttachFiles]: true,
					[PermissionsBitField.Flags.EmbedLinks]: true,
					[PermissionsBitField.Flags.ManageMessages]: true,
				});

				ticketInfo.claimUserId = interaction.user.id;
				await ticketInfo.save();

				const unclaimedButton = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Unclaim Ticket').setCustomId('ticket-unclaim');

				const claimEmbed = new EmbedBuilder().setDescription(`Ticket claimed by <@!${interaction.user.id}>\nThey will be assisting you shortly!`);

				await interaction.reply({
					embeds: [claimEmbed],
					components: [new ActionRowBuilder().addComponents(unclaimedButton)],
				});
			} else if (interaction.customId === 'ticket-unclaim') {
				const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				const ticketInfo = await GuildTicketSchema.findOne({ TicketChannelId: interaction.channel.id });

				if (!interaction.member.roles.cache.some((role) => guildSettings.StaffRoleIDs.includes(role.id)) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
					return interaction.reply({ content: 'You do not have permission to unclaim this ticket.', ephemeral: true });
				}

				if (ticketInfo.claimUserId !== interaction.user.id) {
					return interaction.reply({ content: 'You cannot unclaim a ticket that you did not claim.', ephemeral: true });
				}

				await interaction.message.delete();
				const embedMessage = await interaction.channel.messages.fetch(ticketInfo.TicketEmbedMsgId);

				const [closeButton, deleteButton, claimButton] = embedMessage.components[0].components;
				const enabledClaimButton = ButtonBuilder.from(claimButton).setDisabled(false);

				await embedMessage.edit({
					components: [new ActionRowBuilder().addComponents(closeButton, deleteButton, enabledClaimButton)],
				});

				ticketInfo.claimUserId = null;
				await ticketInfo.save();

				await interaction.channel.permissionOverwrites.edit(interaction.member, {
					[PermissionsBitField.Flags.SendMessages]: false,
					[PermissionsBitField.Flags.AttachFiles]: false,
					[PermissionsBitField.Flags.EmbedLinks]: false,
					[PermissionsBitField.Flags.ManageMessages]: false,
				});

				await interaction.channel.send({
					embeds: [new EmbedBuilder().setDescription(`Ticket unclaimed by <@!${interaction.user.id}>`)],
				});
			}
		}
	} catch (error) {
		console.error('Ticket System Error:', error);
	}
};

async function createTicket(interaction, guildSettings, ticketSupportRoles, ticketOption) {
	try {
		const orderId = guildSettings.CurrentTicketChannelNumber++;
		const ticketName = `${orderId}-${ticketOption.label}-${interaction.user.username}`.toLowerCase();
		const supportRoles = ticketSupportRoles.map((roleId) => ({
			id: roleId,
			allow: [PermissionsBitField.Flags.ViewChannel],
		}));

		await interaction.reply({ content: `Creating ticket...`, ephemeral: true });

		const existingChannel = interaction.guild.channels.cache.find((c) => c.topic === interaction.user.id && c.name.includes(interaction.user.username) && !c.name.includes('closed'));

		if (existingChannel) {
			return interaction.editReply({ content: `You already have a ticket: <#${existingChannel.id}>`, ephemeral: true });
		}

		await guildSettings.save();

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

		const ticketInfo = await GuildTicketSchema.create({
			ticketID: orderId,
			TicketChannelId: createdChannel.id,
			guildId: interaction.guild.id,
			ticketUserID: interaction.user.id,
		});

		await interaction.editReply({ content: `Ticket created successfully in ${createdChannel}!`, ephemeral: true });

		setTimeout(async () => {
			await interaction.deleteReply();
		}, 60000);

		const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('🔒').setCustomId('ticket-close'), new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji('🗑️').setCustomId('ticket-delete'), new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Claim Ticket').setCustomId('ticket-claim'));

		const embed = new EmbedBuilder()
			.setDescription(`# Ticket: ${ticketOption.label} \n\n> ## by: <@!${interaction.user.id}>`)
			.setColor(guildSettings.EmbedOptions.color || 'Aqua')
			.setImage(guildSettings.EmbedOptions.image || null)
			.setFooter({ text: guildSettings.EmbedOptions.footer || null });

		// Find the staff role with the most members
		let mostMembersRole;
		let maxMembers = 0;

		for (const roleId of guildSettings.StaffRoleIDs) {
			const role = interaction.guild.roles.cache.get(roleId);
			if (role && role.members.size > maxMembers) {
				maxMembers = role.members.size;
				mostMembersRole = role;
			}
		}

		const mentionString = mostMembersRole ? `<@&${mostMembersRole.id}>` : `${ticketSupportRoles.map((roleId) => `<@&${roleId}>`).join(', ')}`;

		const ticketMsg = await createdChannel.send({
			content: `${mentionString}. New Ticket!`,
			embeds: [embed],
			components: [row],
		});

		ticketMsg.pin();
		ticketInfo.TicketEmbedMsgId = ticketMsg.id;
		await ticketInfo.save();
	} catch (error) {
		console.error('Error creating ticket:', error);
		await interaction.reply({ content: `An error occurred while creating the ticket. Please try again later.`, ephemeral: true });
	}
}

 async function saveHtml( server, uniqueCode, htmlString){
    const url = `${server}/save`;
    const data = { uniqueCode, htmlString };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const result = await response.text();
			return result;
        } else {
            console.log('Failed to save HTML string. Status:', response.status);
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

/*TODO:
- Once Close or Claim buttons are clicked, the buttons should be disabled.✔
- Send Ticket close and delete logs to the log channel.✔
- Send a message to the user when the ticket is closed or reopen.✔
- handle reopen_ticket button click event.
*/
