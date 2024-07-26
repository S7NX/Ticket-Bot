const { SlashCommandBuilder, ChatInputCommandInteraction, Client, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle, RoleSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const GuildTicket = require('../../models/GuildTicket');

(module.exports = {
	data: new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Various commands for Ticket System.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.addSubcommand((subcommand) => subcommand.setName('setup').setDescription('Setups the Ticket Sytem for the Guild.'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('panel')
				.setDescription('Sends Ticket Panel to a speific channel.')
				.addChannelOption((option) => option.setName('channel').setDescription('Select a channel to send the ticket menu.').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Adds a user to a ticket.')
				.addUserOption((option) => option.setName('user').setDescription('The user to add to the ticket.').setRequired(true))
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Removes a user from the ticket.')
				.addUserOption((option) => option.setName('user').setDescription('The user to remove from the ticket.').setRequired(true))
		),
	async execute(client, interaction) {
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'setup') {
			try {
				await interaction.deferReply({ ephemeral: true });
				let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				if (!guildSettings) {
					guildSettings = new GuildSettings({
						guildId: interaction.guild.id,
					});
					//await guildSettings.save();
				}

				let customid = `${interaction.guild.id}-ticket-menu`;
				let Options;

				if (Array.isArray(guildSettings.TicketMenuOptions) && guildSettings.TicketMenuOptions.length > 0) {
					Options = guildSettings.TicketMenuOptions;
				} else {
					Options = [
						{
							label: 'Help Ticket',
							value: `${customid}-help-ticket`,
							description: 'Open a Ticket',
							emoji: '🎫',
						},
						{
							label: 'Report Ticket',
							value: `${customid}-report-ticket`,
							description: 'Open a Ticket',
							emoji: '🎫',
						},
					];
				}

				const selectMenu = new StringSelectMenuBuilder().setCustomId(customid).setPlaceholder('🔒 Nothing Selected Yet.').addOptions(Options);
				let row = new ActionRowBuilder().addComponents(selectMenu);

				let embed = new EmbedBuilder().setDescription('Select an option to open a ticket. 👇').setFooter({ text: `Made with 💗 by S7NX` });
				if (guildSettings.EmbedOptions) {
					if (guildSettings.EmbedOptions.description) embed.setDescription(guildSettings.EmbedOptions.description);
					if (guildSettings.EmbedOptions.color) embed.setColor(guildSettings.EmbedOptions.color);
					if (guildSettings.EmbedOptions.image) embed.setImage({ url: guildSettings.EmbedOptions.image });
					if (guildSettings.EmbedOptions.footer) embed.setFooter({ text: guildSettings.EmbedOptions.footer });
				}
				let addBtn = new ButtonBuilder().setLabel('Add Option').setCustomId('add-option').setStyle(ButtonStyle.Primary);

				let removeBtn = new ButtonBuilder().setLabel('Remove Option').setCustomId('remove-option').setStyle(ButtonStyle.Danger);

				let editBtn = new ButtonBuilder().setLabel('Edit Embed').setCustomId('edit-embed').setStyle(ButtonStyle.Secondary);
				let confirmBtn = new ButtonBuilder().setLabel('Save & Continue').setCustomId('confrim-button').setStyle(ButtonStyle.Success);

				// Send the embed with the select menu
				let embedMsg = await interaction.channel.send({ embeds: [embed], components: [row] });

				// Create a new row with buttons
				let buttonRow = new ActionRowBuilder().addComponents(addBtn, removeBtn, editBtn, confirmBtn);

				// Reply to the interaction with the buttons
				let btnMsg = await interaction.editReply({ components: [buttonRow], ephemeral: true });
				let filter = (i) => i.isButton() && i.user.id === interaction.user.id;
				let collector = btnMsg.createMessageComponentCollector({ filter, idle: 60000 });

				collector.on('collect', async (i) => {
					switch (i.customId) {
						case `add-option`:
							await add_option(i, embedMsg, customid, Options, guildSettings);
							collector.resetTimer();
							break;
						case `remove-option`:
							await remove_option(i, embedMsg, customid, Options, guildSettings);
							collector.resetTimer();
							break;
						case `edit-embed`:
							await edit_embed(i, embedMsg, customid, Options, guildSettings);
							collector.resetTimer();
							break;
						case `confrim-button`:
							await confrim_button(i, collector, embedMsg, guildSettings);
							break;
						default:
							break;
					}
					//collector.stop();
				});
			} catch (error) {
				console.error(error);
			}
		} else if (subcommand === 'panel') {
			try {
				interaction.deferReply({ ephemeral: true });
				const channel = interaction.options.getChannel('channel');
				let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				if (!guildSettings) {
					guildSettings = new GuildSettings({
						guildId: interaction.guild.id,
					});
				}
				let Options = guildSettings.TicketMenuOptions;
				const selectMenu = new StringSelectMenuBuilder().setCustomId(`${interaction.guild.id}-ticket-menu`).setPlaceholder('🔒 Nothing Selected Yet.').addOptions(Options);
				let row = new ActionRowBuilder().addComponents(selectMenu);

				let embed = new EmbedBuilder().setDescription('Select an option to open a ticket. 👇').setFooter({ text: `Made with 💗 by S7NX` });
				if (guildSettings.EmbedOptions) {
					if (guildSettings.EmbedOptions.description) embed.setDescription(guildSettings.EmbedOptions.description);
					if (guildSettings.EmbedOptions.color) embed.setColor(guildSettings.EmbedOptions.color);
					if (guildSettings.EmbedOptions.image) embed.setImage({ url: guildSettings.EmbedOptions.image });
					if (guildSettings.EmbedOptions.footer) embed.setFooter({ text: guildSettings.EmbedOptions.footer });
				}
				let panelMsg = await channel.send({ embeds: [embed], components: [row] });
				guildSettings.PanelChannelID = channel.id;
				guildSettings.PanelMessageID = panelMsg.id;
				guildSettings.save();
				await interaction.editReply({ content: `Ticket Menu has been sent to <#${channel.id}>.`, ephemeral: true });
			} catch (e) {
				console.log(e);
			}
		} else if (subcommand === 'add') {
			try {
				interaction.deferReply({ ephemeral: true });
				let user = interaction.options.getUser('user');
				let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				if (!guildSettings) {
					guildSettings = new GuildSettings({
						guildId: interaction.guild.id,
					});
					await guildSettings.save();
				}
				let ticket = await GuildTicket.findOne({ TicketChannelId: interaction.channel.id });
				if (!ticket) {
					return await interaction.editReply({ content: 'This is not a ticket channel.', ephemeral: true });
				}
				let ticketChannel = interaction.guild.channels.cache.get(ticket.TicketChannelId);
				await ticketChannel.permissionOverwrites.edit(user, {
					[PermissionsBitField.Flags.ViewChannel]: true,
					[PermissionsBitField.Flags.SendMessages]: true,
					[PermissionsBitField.Flags.AttachFiles]: true,
					[PermissionsBitField.Flags.EmbedLinks]: true,
				});
				await interaction.editReply({ content: `${user} has been added to the ticket.`, ephemeral: true });
			} catch (error) {
				console.error(error);
			}
		} else if (subcommand === 'remove') {
			try {
				interaction.deferReply({ ephemeral: true });
				let user = interaction.options.getUser('user');
				let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
				if (!guildSettings) {
					guildSettings = new GuildSettings({
						guildId: interaction.guild.id,
					});
					await guildSettings.save();
				}
				let ticket = await GuildTicket.findOne({ TicketChannelId: interaction.channel.id });
				if (!ticket) {
					return await interaction.editReply({ content: 'This is not a ticket channel.', ephemeral: true });
				}
				let ticketChannel = interaction.guild.channels.cache.get(ticket.TicketChannelId);
				await ticketChannel.permissionOverwrites.edit(user, {
					[PermissionsBitField.Flags.ViewChannel]: false,
					[PermissionsBitField.Flags.SendMessages]: false,
					[PermissionsBitField.Flags.AttachFiles]: false,
					[PermissionsBitField.Flags.EmbedLinks]: false,
				});
				await interaction.editReply({ content: `${user} has been removed from the ticket.`, ephemeral: true });
			} catch (error) {
				console.error(error);
			}
		}
	},
}),
	async function add_option(interaction, embedMsg, customid, Options, guildSettings) {
		if (!interaction) return;
		let modal = new ModalBuilder().setCustomId(`addBtn-modal`).setTitle('Add Option');
		let optionName = new TextInputBuilder().setCustomId(`addBtn-modal-input-name`).setLabel('Option Name').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(100).setRequired(true);
		let optionDescription = new TextInputBuilder().setCustomId(`addBtn-modal-input-description`).setMinLength(1).setMaxLength(100).setLabel('Option Description').setStyle(TextInputStyle.Paragraph).setRequired(false);
		let optionEmoji = new TextInputBuilder().setCustomId(`addBtn-modal-input-emoji`).setLabel('Option Emoji').setStyle(TextInputStyle.Short).setRequired(false);
		const modalrow1 = new ActionRowBuilder().addComponents(optionName);
		const modalrow2 = new ActionRowBuilder().addComponents(optionDescription);
		const modalrow3 = new ActionRowBuilder().addComponents(optionEmoji);
		modal.addComponents(modalrow1, modalrow2, modalrow3);
		await interaction.showModal(modal);
		let Modalfilter = (ModalInteraction) => ModalInteraction.customId === 'addBtn-modal';
		interaction
			.awaitModalSubmit({ Modalfilter, time: 60_000 })
			.then(async (ModalInteraction) => {
				let optionName = await ModalInteraction.fields.getTextInputValue('addBtn-modal-input-name');
				let optionDescription = await ModalInteraction.fields.getTextInputValue('addBtn-modal-input-description');
				let optionEmoji = await ModalInteraction.fields.getTextInputValue('addBtn-modal-input-emoji');

				if (Options.some((option) => option.label.toLowerCase() === optionName.toLowerCase())) {
					return ModalInteraction.reply({
						content: 'Option name already exists. Please choose a different name.',
						ephemeral: true,
					});
				}

				let Option = {
					value: `${customid}-${optionName.toLowerCase().replace(' ', '-')}`,
				};
				Option.label = optionName;
				if (optionDescription) Option.description = optionDescription;
				if (optionEmoji) Option.emoji = optionEmoji;
				Options.push(Option);
				let modalrow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().addOptions(Options).setCustomId(customid));
				embedMsg.edit({ components: [modalrow] });
				ModalInteraction.reply({ content: 'Option Added.', ephemeral: true });
				guildSettings.TicketMenuOptions = Options;
				//await guildSettings.save();
			})
			.catch(console.error);
	};

async function remove_option(interaction, embedMsg, customid, Options, guildSettings) {
	if (!interaction) return;
	let modal = new ModalBuilder().setCustomId(`removeBtn-modal`).setTitle('Remove Option');
	let optionNumber = new TextInputBuilder().setCustomId(`removeBtn-modal-input-number`).setLabel('Option Name').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(1).setPlaceholder(`1 - ${Options.length}`).setRequired(true);
	const modalrow1 = new ActionRowBuilder().addComponents(optionNumber);
	modal.addComponents(modalrow1);
	await interaction.showModal(modal);
	let Modalfilter = (ModalInteraction) => ModalInteraction.customId === 'addBtn-modal';
	interaction.awaitModalSubmit({ Modalfilter, time: 60_000 }).then(async (ModalInteraction) => {
		let optionNumber = await ModalInteraction.fields.getTextInputValue('removeBtn-modal-input-number');
		if (isNaN(optionNumber)) {
			return ModalInteraction.reply({ content: 'Please enter a valid number.', ephemeral: true });
		}
		let index = parseInt(optionNumber) - 1;
		if (index >= 0 && index < Options.length) {
			Options.splice(index, 1);
			let modalrow = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().addOptions(Options).setCustomId(customid));
			embedMsg.edit({ components: [modalrow] });
			ModalInteraction.reply({ content: 'Option Removed.', ephemeral: true });
			guildSettings.TicketMenuOptions = Options;
			//await guildSettings.save();
		} else {
			ModalInteraction.reply({ content: 'Please enter a valid number.', ephemeral: true });
		}
	});
}

async function edit_embed(interaction, embedMsg, customid, Options, guildSettings) {
	if (!interaction) return;

	let embedData = embedMsg.embeds[0].data; // Accessing the embed object directly

	let modal = new ModalBuilder().setCustomId(`editEmbed-modal`).setTitle('Edit Embed');

	let embedDescription = new TextInputBuilder().setCustomId(`editBtn-modal-input-description`).setLabel('Embed Description').setStyle(TextInputStyle.Paragraph).setMinLength(1).setMaxLength(4000).setRequired(true);

	let embedImage = new TextInputBuilder().setCustomId(`editBtn-modal-input-image`).setLabel('Embed Image').setStyle(TextInputStyle.Short).setRequired(false);

	let embedColor = new TextInputBuilder().setCustomId(`editBtn-modal-input-color`).setLabel('Embed Color').setStyle(TextInputStyle.Short).setPlaceholder('Hex color code').setMaxLength(7).setMinLength(7).setRequired(false);

	let embedFooter = new TextInputBuilder().setCustomId(`editBtn-modal-input-footer`).setLabel('Embed Footer').setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2048).setRequired(false);

	if (guildSettings.EmbedOptions || embedData) {
		if (guildSettings.EmbedOptions.description) {
			embedDescription.setValue(guildSettings.EmbedOptions.description);
		} else if (embedData.description) {
			embedDescription.setValue(embedData.description); // Providing a default value if both are undefined
		}

		if (guildSettings.EmbedOptions.color) {
			embedColor.setValue(guildSettings.EmbedOptions.color);
		} else if (embedData.color) {
			embedColor.setValue(`#${embedData.color.toString(16).padStart(6, '0')}`); // Providing a default value if both are undefined
		}

		if (guildSettings.EmbedOptions.Image) {
			embedImage.setValue(guildSettings.EmbedOptions.Image);
		} else if (embedData.image && embedData.image.url) {
			embedImage.setValue(embedData.image.url); // Providing a default value if both are undefined
		}

		if (guildSettings.EmbedOptions.footer) {
			embedFooter.setValue(guildSettings.EmbedOptions.footer);
		} else if (embedData.footer && embedData.footer.text) {
			embedFooter.setValue(embedData.footer.text); // Providing a default value if both are undefined
		}
	}

	const modalRow1 = new ActionRowBuilder().addComponents(embedDescription);
	const modalRow2 = new ActionRowBuilder().addComponents(embedImage);
	const modalRow3 = new ActionRowBuilder().addComponents(embedColor);
	const modalRow4 = new ActionRowBuilder().addComponents(embedFooter);

	modal.addComponents(modalRow1, modalRow2, modalRow3, modalRow4);

	await interaction.showModal(modal);

	try {
		let Modalfilter = (ModalInteraction) => ModalInteraction.customId === 'editEmbed-modal';
		interaction.awaitModalSubmit({ filter: Modalfilter, time: 60_000 }).then(async (ModalInteraction) => {
			let newEmbed = {
				description: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-description'),
				image: {
					url: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-image') || null,
				},
				color: parseInt(ModalInteraction.fields.getTextInputValue('editBtn-modal-input-color').replace('#', ''), 16) || null,
				footer: {
					text: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-footer') || null,
				},
			};
			// Update the embed
			await embedMsg.edit({ embeds: [newEmbed] });

			await ModalInteraction.reply({
				content: 'Embed updated successfully.',
				ephemeral: true,
			});

			// Update guild settings
			guildSettings.EmbedOptions.description = newEmbed.description;
			guildSettings.EmbedOptions.color = ModalInteraction.fields.getTextInputValue('editBtn-modal-input-color');
			guildSettings.EmbedOptions.Image = newEmbed.image.url;
			guildSettings.EmbedOptions.footer = newEmbed.footer.text;
			//await guildSettings.save();
		});
	} catch (error) {
		console.error('Error editing embed:', error);
		await interaction.reply({
			content: 'An error occurred while editing the embed.',
			ephemeral: true,
		});
	}
}
async function confrim_button(interaction, collector, embedMsg, guildSettings) {
	if (!interaction) return;
	await embedMsg.delete();
	await guildSettings.save();
	//await interaction.reply({ content: 'Ticket Menu Setup Complete. Use `/ticket send-panel` to send it to a Spefic Channel or Directly use it from here.', ephemeral: true });
	await collector.stop();
	await StaffRoleSelection(interaction, guildSettings);
}

async function StaffRoleSelection(interaction, guildSettings) {
	// Step 1: Display initial embed and role selection menu
	embed = new EmbedBuilder().setDescription('Please select your staff roles:');
	let menu = new RoleSelectMenuBuilder().setCustomId('staff-ticket-view').setPlaceholder('Select Staff Roles').setMinValues(1).setMaxValues(20);
	let actionrow = new ActionRowBuilder().addComponents(menu);
	let mainmsg = await interaction.update({ embeds: [embed], components: [actionrow], ephemeral: true, fetchReply: true });

	// Step 2: Create collector for role selection
	let collectorFilter = (interaction) => interaction.customId === 'staff-ticket-view';
	let collector = await mainmsg.createMessageComponentCollector({ filter: collectorFilter, idle: 60000 });

	// Step 3: Handle role selection
	collector.on('collect', async (interaction) => {
		// Store selected role IDs in guildSettings or wherever appropriate
		guildSettings.StaffRoleIDs = interaction.values;

		// Step 4: Update interaction with new options (example buttons)
		embed.setDescription('Which category would you like to create tickets on?');
		const speficBtn = new ButtonBuilder().setCustomId('SpeficBtnCategory').setLabel('Specific Category for All Tickets').setStyle(ButtonStyle.Secondary);
		const createforME = new ButtonBuilder().setCustomId('CreateCategoryForMe').setLabel('Create Category For Me').setStyle(ButtonStyle.Secondary);
		row = new ActionRowBuilder().addComponents(speficBtn, createforME);
		mainmsg = await interaction.update({ embeds: [embed], components: [row], fetchReply: true });
		// Step 5: Stop the collector after first interaction
		collector.stop();

		//categorySelection
		collectorFilter = (interaction) => interaction.customId === 'SpeficBtnCategory' || interaction.customId === 'CreateCategoryForMe';
		collector = await mainmsg.createMessageComponentCollector({ filter: collectorFilter, idle: 60000 });

		await CategorySelection(collector, guildSettings);
	});
}
async function CategorySelection(collector, guildSettings) {
	try {
		let logchlCollector;
		collector.on('collect', async (interaction) => {
			let supportRoles = guildSettings.StaffRoleIDs.map((x) => ({
				id: x,
				allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.ManageMessages],
			}));
			if (interaction.customId === 'SpeficBtnCategory') {
				embed = new EmbedBuilder().setDescription('Please select a category for all tickets:');
				menu = new ChannelSelectMenuBuilder().setCustomId('ticket-category-view').setChannelTypes('GuildCategory').setPlaceholder('Select Category');
				actionrow = new ActionRowBuilder().addComponents(menu);
				mainmsg = await interaction.update({ embeds: [embed], components: [actionrow], ephemeral: true, fetchReply: true });
				collectorFilter = (interaction) => interaction.customId === 'ticket-category-view';
				collector = await mainmsg.createMessageComponentCollector({ filter: collectorFilter, idle: 60000 });
				collector.on('collect', async (interaction) => {
					guildSettings.TicketCategory = interaction.values[0];
					let channel = interaction.channels.first();
					channel.permissionOverwrites.set([
						{
							deny: PermissionsBitField.Flags.ViewChannel,
							id: interaction.guild.id,
						},
						...supportRoles,
					]);
					await guildSettings.save();
					embed = new EmbedBuilder().setDescription('Please select a channel to log tickets:');
					row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket-log-chl').setChannelTypes(ChannelType.GuildText).setPlaceholder('Select Log Channel'));
					mainmsg = await interaction.update({ components: [row], embeds: [embed], ephemeral: true });
					logchlCollector = await mainmsg.createMessageComponentCollector({ filter: (i) => i.customId === 'ticket-log-chl', idle: 60000 });

					await logChannel(logchlCollector, guildSettings);
				});
			} else if (interaction.customId === 'CreateCategoryForMe') {
				for (let ticket of guildSettings.TicketMenuOptions) {
					let categoryName = `${ticket.label}`;
					let existingCategory = interaction.guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName);
					let index = guildSettings.TicketMenuOptions.findIndex((x) => x.value === ticket.value); //find ticket index in guildsetting
					if (existingCategory) {
						if (existingCategory.id === ticket.Category) {
							continue; // Ticket category is already correct, continue to the next ticket
						} else {
							ticket.Category = existingCategory.id; // Update ticket category to existing category id
							guildSettings.TicketMenuOptions[index] = ticket;
						}
					} else {
						// Create a new category since it doesn't exist

						let newCategory = await interaction.guild.channels.create({
							name: categoryName,
							type: ChannelType.GuildCategory,
							permissionOverwrites: [
								{
									deny: PermissionsBitField.Flags.ViewChannel,
									id: interaction.guild.id,
								},
								...supportRoles,
							],
						});
						ticket.Category = newCategory.id; // Set ticket category to new category id
						guildSettings.TicketMenuOptions[index] = ticket;
					}
				}
				let categoryName = `Closed Tickets`;
				let existingCategory = interaction.guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName);

				if (existingCategory && guildSettings.ClosedTicketCategory !== existingCategory.id) {
					guildSettings.ClosedTicketCategory = existingCategory.id; // Update ticket category to existing category id
				} else if (!existingCategory) {
					let newCategory = await interaction.guild.channels.create({
						name: categoryName,
						type: ChannelType.GuildCategory,
						permissionOverwrites: [
							{
								deny: PermissionsBitField.Flags.ViewChannel,
								id: interaction.guild.id,
							},
							...supportRoles,
						],
					});
					guildSettings.ClosedTicketCategory = newCategory.id;
				}
				guildSettings.TicketCategory = null;
				guildSettings.save();

				embed = new EmbedBuilder().setDescription('Please select a channel to log tickets:');
				row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket-log-chl').setChannelTypes(ChannelType.GuildText).setPlaceholder('Select Log Channel'));
				mainmsg = await interaction.update({ components: [row], embeds: [embed], ephemeral: true });
				logchlCollector = mainmsg.createMessageComponentCollector({ filter: (i) => i.customId === 'ticket-log-chl', idle: 60000 });

				await logChannel(logchlCollector, guildSettings);
			}
		});
	} catch (e) {
		console.log(e);
	}
}
async function logChannel(collector, guildSettings) {
	collector.on('collect', async (interaction) => {
		guildSettings.TicketLogChannelID = interaction.values[0];
		await guildSettings.save();

		if (guildSettings.PanelChannelID && guildSettings.PanelMessageID) {
			await interaction.update({ components: [], embeds: [new EmbedBuilder().setDescription(`Ticket System Setup Complete. https://discord.com/channels/${interaction.guild.id}/${guildSettings.PanelChannelID}/${guildSettings.PanelMessageID}`)], ephemeral: true });
			let returned = await updatePanel(interaction, guildSettings);
			returned.panelMessage.edit({ embeds: [returned.embed], components: [returned.row] });
			return collector.stop();
		} else {
			collector.stop();
			embed = new EmbedBuilder().setDescription('Please select a channel for Ticket Panel');
			row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('ticket-panel').setChannelTypes(ChannelType.GuildText).setPlaceholder('Select Log Channel'));
			mainmsg = await interaction.update({ components: [row], embeds: [embed], ephemeral: true });
			collector = mainmsg.createMessageComponentCollector({ filter: (i) => i.customId === 'ticket-panel', idle: 60000 });
			panelChannel(collector, guildSettings);
		}
	});
}
async function panelChannel(collector, guildSettings) {
	collector.on('collect', async (interaction) => {
		let returned = await updatePanel(interaction, guildSettings);
		let channel = interaction.channels.first();
		let panelmsg = await channel.send({ embeds: [returned.embed], components: [returned.row] });
		guildSettings.PanelChannelID = interaction.values[0];
		guildSettings.PanelMessageID = panelmsg.id;
		await guildSettings.save();
		await interaction.update({ components: [], embeds: [new EmbedBuilder().setDescription(`Ticket System Setup Complete. ${panelmsg.url} `)], ephemeral: true });
	});
}
async function updatePanel(interaction, guildSettings) {
	//fetches channel and message using guildSettings
	let panelChannel;
	let panelMessage;
	if (guildSettings.PanelChannelID && guildSettings.PanelMessageID) {
		panelChannel = await interaction.guild.channels.cache.get(guildSettings.PanelChannelID);
		panelMessage = await panelChannel.messages.fetch(guildSettings.PanelMessageID);
	}
	let Options = guildSettings.TicketMenuOptions;
	const selectMenu = new StringSelectMenuBuilder().setCustomId(`${interaction.guild.id}-ticket-menu`).setPlaceholder('🔒 Nothing Selected Yet.').addOptions(Options);
	let row = new ActionRowBuilder().addComponents(selectMenu);

	let embed = new EmbedBuilder().setDescription('Select an option to open a ticket. 👇').setFooter({ text: `Made with 💗 by S7NX` });
	if (guildSettings.EmbedOptions) {
		if (guildSettings.EmbedOptions.description) embed.setDescription(guildSettings.EmbedOptions.description);
		if (guildSettings.EmbedOptions.color) embed.setColor(guildSettings.EmbedOptions.color);
		if (guildSettings.EmbedOptions.image) embed.setImage({ url: guildSettings.EmbedOptions.image });
		if (guildSettings.EmbedOptions.footer) embed.setFooter({ text: guildSettings.EmbedOptions.footer });
	}
	return { panelMessage, embed, row };
}
