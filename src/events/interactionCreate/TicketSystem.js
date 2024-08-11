const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const GuildTicketSchema = require('../../models/GuildTicket');
const discordTranscripts = require('t4discordjs');
const axios = require('axios');

module.exports = async (client, interaction) => {
	try {
		if (interaction.isStringSelectMenu()) {
			try {
				const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				if (!guildSettings) return;
		
				// Extract the values from TicketMenuOptions for comparison
				const ticketMenuValues = guildSettings.TicketMenuOptions.map((option) => option.value);
		
				if (!ticketMenuValues.includes(interaction.values[0])) {
					return interaction.reply({ content: 'Invalid Ticket Menu Option', ephemeral: true });
				}
		
				const ticketOption = guildSettings.TicketMenuOptions.find((option) => option.value === interaction.values[0]);
				const intmsg = interaction.message;
		
				await intmsg.edit({
					embeds: [EmbedBuilder.from(intmsg.embeds[0])],
					components: [ActionRowBuilder.from(intmsg.components[0])]
				});
		
				await createTicket(interaction, guildSettings, guildSettings.StaffRoleIDs, ticketOption);
			} catch (error) {
				console.error('Error handling string select menu interaction:', error);
				const errorMessage = error.message || 'An unknown error occurred';
				await interaction.reply({ content: `An error occurred while processing your request: ${errorMessage}. Please try again later.`, ephemeral: true });
			}
		}	else if (interaction.isButton()) {
			if (interaction.customId === 'ticket-close') {
				try {
					await interaction.deferReply();
					const confirm = new ButtonBuilder().setCustomId('close_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
					const cancel = new ButtonBuilder().setCustomId('close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
			
					const row = new ActionRowBuilder().addComponents(confirm, cancel);
			
					await interaction.editReply({ content: 'Are you sure you want to close this ticket?', components: [row] });
				} catch (error) {
					console.error('Error handling ticket-close:', error);
					await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
				}
			} else if (interaction.customId === 'close_confirm') {
				try {
					const channel = interaction.channel;
					const parentId = channel.parent?.id;
			
					const [guildSettings, ticketInfo] = await Promise.all([
						GuildSettings.findOne({ guildId: interaction.guild.id }),
						GuildTicketSchema.findOne({ TicketChannelId: channel.id })
					]);
			
					await interaction.message.delete();
					const member = await interaction.guild.members.fetch(ticketInfo.ticketUserID);
					const logChannel = await interaction.guild.channels.fetch(guildSettings.TicketLogChannelID);
					const embedMessage = await channel.messages.fetch(ticketInfo.TicketEmbedMsgId);
			
					const [closeButton, deleteButton, claimButton] = embedMessage.components[0].components;
					const disabledCloseButton = ButtonBuilder.from(closeButton).setDisabled(true);
			
					await embedMessage.edit({
						components: [new ActionRowBuilder().addComponents(disabledCloseButton, deleteButton, claimButton)],
					});
			
					await channel.permissionOverwrites.edit(member.user, {
						[PermissionsBitField.Flags.ViewChannel]: false,
					});
			
					const orderId = ticketInfo.ticketID;
					await channel.edit({
						name: `${orderId}-closed-${member.user.username}`,
						parent: guildSettings.ClosedTicketCategory || parentId,
					});
			
					const StringTranscript = await discordTranscripts.createTranscript(channel, {
						poweredBy: false,
						returnType: 'string',
						useNewCSS: true,
						footerText: 'Exported {number} message{s}',
						DisableTranscriptLogs: true,
						FileConfig: {
							SaveAttachments: true,
							SaveExternalEmojis: true,
							SaveStickers: true,
							AttachmentOptions: {
								FetchAttachmentFiles: true,
							},
							ExternalEmojiOptions: {
								SaveReactionEmojis: true,
								SaveComponentEmojis: true,
								SaveMessageEmojis: true,
							},
						},
					});
			
					const uniqueCode = `${Date.now().toString(36) + Math.random().toString(36).substring(2, 10)}`;
					saveHtml('https://s7nx.is-a-awesome.dev', uniqueCode, StringTranscript);
					const url = `https://s7nx.is-a-awesome.dev/transcript/${uniqueCode}`;
					const transcriptButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Transcript').setURL(url);
			
					const ticketClosedEmbed = new EmbedBuilder().setDescription(`## Ticket Closed \n> ### ***Ticket ID: ${orderId} :arrow_right: 🔒 Closed*** \n### Ticket System.`);
			
					const reopenButton = new ButtonBuilder().setLabel('Reopen Ticket!').setStyle(ButtonStyle.Secondary).setCustomId('reopen_ticket');
			
					const actionRow = new ActionRowBuilder().addComponents(transcriptButton, reopenButton);
			
					await interaction.channel.send({
						content: '## Ticket Closed.',
						embeds: [ticketClosedEmbed],
						components: [new ActionRowBuilder().addComponents(transcriptButton)],
					});
			
					if (logChannel) {
						const logMessage = await logChannel.send({
							embeds: [ticketClosedEmbed],
							components: [actionRow],
						});
						ticketInfo.logMessageId = logMessage.id;
					}
			
					const memberEmbed = new EmbedBuilder().setDescription(`## ${interaction.guild.name} \n### Your Ticket has been Closed.\n> ### ***Ticket ID: ${orderId} :arrow_right: 🔒 Closed*** \n### Ticket System.`);
			
					await member.user.send({
						embeds: [memberEmbed],
						components: [new ActionRowBuilder().addComponents(transcriptButton)],
					});
			
					ticketInfo.TicketStatus = 'Closed';
					await ticketInfo.save();
				} catch (error) {
					console.error('Error handling close_confirm:', error);
					await interaction.reply({ content: 'An error occurred while closing the ticket.', ephemeral: true });
				}
			} else if (interaction.customId === 'close_cancel' || interaction.customId === 'delete_cancel') {
				try {
					await interaction.message.delete();
				} catch (error) {
					console.error('Error handling close_cancel or delete_cancel:', error);
					await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
				}
			}else if (interaction.customId === 'ticket-delete') {
					try {
						const confirm = new ButtonBuilder().setCustomId('delete_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
						const cancel = new ButtonBuilder().setCustomId('delete_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
						const row = new ActionRowBuilder().addComponents(confirm, cancel);
				
						await interaction.reply({ content: 'Are you sure you want to delete this ticket?', components: [row] });
					} catch (error) {
						console.error('Error handling ticket-delete:', error);
						await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
					}
			} else if (interaction.customId === 'delete_confirm') {
					try {
						const channel = interaction.channel;
						const member = interaction.guild.members.cache.get(channel.topic);
						const [guildSettings, ticketInfo] = await Promise.all([
							GuildSettings.findOne({ guildId: interaction.guild.id }),
							GuildTicketSchema.findOne({ TicketChannelId: channel.id })
						]);
				
						await interaction.message.delete();
						const logChannel = interaction.guild.channels.cache.get(guildSettings.TicketLogChannelID);
						const orderId = ticketInfo.ticketID;
				
						await interaction.channel.send({ content: '## Ticket Deleted.' });
				
						const embed = new EmbedBuilder()
							.setDescription(`## ${interaction.guild.name} \n### Your Ticket has been Deleted.\n> ### ***Ticket ID: ${orderId} :arrow_right: 🗑️ Deleted*** \n### Ticket System.`);
				
						const StringTranscript = await discordTranscripts.createTranscript(channel, {
							poweredBy: false,
							returnType: 'string',
							useNewCSS: true,
							footerText: 'Exported {number} message{s}',
							DisableTranscriptLogs: true,
							FileConfig: {
								SaveAttachments: true,
								SaveExternalEmojis: true,
								SaveStickers: true,
								AttachmentOptions: {
									FetchAttachmentFiles: true,
								},
								ExternalEmojiOptions: {
									SaveReactionEmojis: true,
									SaveComponentEmojis: true,
									SaveMessageEmojis: true,
								},
							},
						});
				
						const uniqueCode = `${Date.now().toString(36) + Math.random().toString(36).substring(2, 10)}`;
						saveHtml('https://s7nx.is-a-awesome.dev', uniqueCode, StringTranscript);
						const url = `https://s7nx.is-a-awesome.dev/transcript/${uniqueCode}`;
						const transcriptButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Transcript').setURL(url);
				
						await channel.delete();
				
						if (ticketInfo.TicketStatus !== 'Closed') {
							await member.send({ embeds: [embed], components: [new ActionRowBuilder().addComponents(transcriptButton)] });
						}
						if (logChannel) {
							const logEmbed = new EmbedBuilder()
								.setDescription(`## Ticket Deleted \n> ### ***Ticket ID: ${orderId} :arrow_right: 🗑️ Deleted*** \n### Ticket System.`);
							await logChannel.send({ embeds: [logEmbed], components: [new ActionRowBuilder().addComponents(transcriptButton)] });
						}
						if (ticketInfo.logMessageId) {
							const logMessage = await logChannel.messages.fetch(ticketInfo.logMessageId);
							await logMessage.delete();
						}
						await ticketInfo.deleteOne();
					} catch (error) {
						console.error('Error handling delete_confirm:', error);
						await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
					}
			} else if (interaction.customId === 'ticket-claim') {
					try {
						const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
						const ticketInfo = await GuildTicketSchema.findOne({ TicketChannelId: interaction.channel.id });
				
						if (!interaction.member.roles.cache.some((role) => guildSettings.StaffRoleIDs.includes(role.id)) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
							return interaction.reply({ content: 'You do not have permission to claim this ticket.', ephemeral: true });
						}
						if (ticketInfo.TicketStatus === 'Closed') {
							return interaction.reply({ content: 'This Ticket is closed.', ephemeral: true });
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
					} catch (error) {
						console.error('Error handling ticket-claim:', error);
						await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
					}
			} else if (interaction.customId === 'ticket-unclaim') {
					try {
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
					} catch (error) {
						console.error('Error handling ticket-unclaim:', error);
						await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
					}
			} else if (interaction.customId === 'reopen_ticket') {
					try {
						const guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
						const ticketInfo = await GuildTicketSchema.findOne({ logMessageId: interaction.message.id });
				
						await interaction.reply({ content: 'Reopening ticket...', ephemeral: true });
				
						if (!ticketInfo || interaction.message.id !== ticketInfo.logMessageId) {
							return interaction.editReply({ content: 'You cannot reopen this ticket.', ephemeral: true });
						}
				
						if (ticketInfo.TicketStatus !== 'Closed') {
							return interaction.editReply({ content: "This ticket isn't closed.", ephemeral: true });
						}
				
						const closedTicketChannel = await interaction.guild.channels.fetch(ticketInfo.TicketChannelId);
						if (!closedTicketChannel) {
							return interaction.editReply({ content: 'Ticket channel not found.', ephemeral: true });
						}
				
						const TicketOwner = await interaction.guild.members.fetch(ticketInfo.ticketUserID);
						if (!TicketOwner) {
							return interaction.editReply({ content: 'Ticket Owner not found.', ephemeral: true });
						}
				
						await interaction.editReply({ content: `Ticket Reopened: ${closedTicketChannel} ` });
						setTimeout(async () => {
							await interaction.deleteReply();
						}, 2500);
				
						const channelName = `${ticketInfo.ticketID}-${ticketInfo.ticketMenuOption[0].label}-${TicketOwner.user.username}`.toLowerCase();
						await closedTicketChannel.edit({
							name: channelName,
							parent: guildSettings.TicketCategory || ticketInfo.ticketMenuOption[0].Category,
						});
				
						const staffRoleIDs = guildSettings.StaffRoleIDs;
						const supportRoles = staffRoleIDs.map((roleId) => ({
							id: roleId,
							allow: [PermissionsBitField.Flags.ViewChannel],
						}));
				
						await closedTicketChannel.permissionOverwrites.set([
							{
								allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks],
								id: TicketOwner.id,
							},
							{
								deny: PermissionsBitField.Flags.ViewChannel,
								id: interaction.guild.id,
							},
							...supportRoles,
						]);
				
						let mostMembersRole;
						let maxMembers = 0;
				
						for (const roleId of staffRoleIDs) {
							const role = interaction.guild.roles.cache.get(roleId);
							if (role && role.members.size > maxMembers) {
								maxMembers = role.members.size;
								mostMembersRole = role;
							}
						}
				
						const oldEmbed = await closedTicketChannel.messages.fetch(ticketInfo.TicketEmbedMsgId);
						await oldEmbed.edit({ components: [] });
				
						const mentionString = mostMembersRole ? `<@&${mostMembersRole.id}>` : staffRoleIDs.map((roleId) => `<@&${roleId}>`).join(', ');
				
						const embed = new EmbedBuilder().setDescription(`# Ticket: ${ticketInfo.ticketMenuOption[0].label}`);
						const actionRow = new ActionRowBuilder().addComponents(
							new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('🔒').setCustomId('ticket-close'),
							new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji('🗑️').setCustomId('ticket-delete'),
							new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Claim Ticket').setCustomId('ticket-claim')
						);
				
						const TicketEmbedMsg = await closedTicketChannel.send({
							content: `# Ticket Reopened! <@${TicketOwner.id}>, ${mentionString}`,
							embeds: [embed],
							components: [actionRow],
						});
				
						ticketInfo.TicketEmbedMsgId = TicketEmbedMsg.id;
						ticketInfo.TicketStatus = 'Open';
						await ticketInfo.save();
					} catch (error) {
						console.error('Error handling reopen_ticket:', error);
						await interaction.reply({ content: 'An error occurred while reopening the ticket.', ephemeral: true });
					}
			}

		} 
	
	} catch (error) {
		console.error('Error handling interaction:', error);
		const errorMessage = error.message || 'An unknown error occurred';
		await interaction.reply({ content: `An error occurred while processing your request: ${errorMessage}. Please try again later.`, ephemeral: true });
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

        const existingChannel = interaction.guild.channels.cache.find(
            (c) => c.topic === interaction.user.id && c.name.includes(interaction.user.username) && !c.name.includes('closed')
        );

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
                    allow: [
                        PermissionsBitField.Flags.ViewChannel,
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.EmbedLinks,
                    ],
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
            ticketMenuOption: ticketOption,
        });

        await interaction.editReply({ content: `Ticket created successfully in ${createdChannel}!`, ephemeral: true });

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 60000);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setStyle(ButtonStyle.Secondary).setEmoji('🔒').setCustomId('ticket-close'),
            new ButtonBuilder().setStyle(ButtonStyle.Danger).setEmoji('🗑️').setCustomId('ticket-delete'),
            new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Claim Ticket').setCustomId('ticket-claim')
        );

        const embed = new EmbedBuilder()
            .setDescription(`# Ticket: ${ticketOption.label} \n\n> ## by: <@!${interaction.user.id}>`)
            .setColor(guildSettings.EmbedOptions.color || 'Aqua')
            .setImage(guildSettings.EmbedOptions.image || null)
            .setFooter({ text: guildSettings.EmbedOptions.footer || null });

        // Find the staff role with the most members
        const mostMembersRole = guildSettings.StaffRoleIDs.reduce((mostMembersRole, roleId) => {
            const role = interaction.guild.roles.cache.get(roleId);
            return role && role.members.size > (mostMembersRole?.members.size || 0) ? role : mostMembersRole;
        }, null);

        const mentionString = mostMembersRole
            ? `<@&${mostMembersRole.id}>`
            : ticketSupportRoles.map((roleId) => `<@&${roleId}>`).join(', ');

        const ticketMsg = await createdChannel.send({
            content: `${mentionString}. New Ticket!`,
            embeds: [embed],
            components: [row],
        });

        await ticketMsg.pin();
        ticketInfo.TicketEmbedMsgId = ticketMsg.id;
        await ticketInfo.save();
    } catch (error) {
        console.error('Error creating ticket:', error);
        const errorMessage = error.message || 'An unknown error occurred';
        await interaction.reply({ content: `An error occurred while creating the ticket: ${errorMessage}. Please try again later.`, ephemeral: true });
    }
}

async function saveHtml(server, uniqueCode, htmlString) {
    const url = `${server}/save`;
    const data = { uniqueCode, htmlString };

    try {
        const response = await axios.post(url, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            console.error('Failed to save Transcript. Status:', response.status);
        }
    } catch (error) {
        console.error('Error saving Transcript');
    }
}