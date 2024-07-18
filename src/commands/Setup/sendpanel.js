const GuildSettings = require('../../models/GuildSettings');
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder().setName('send-panel').setDescription('Sends Ticket Panel.').addChannelOption(option => option.setName('channel').setDescription('Select a channel to send the ticket menu.').setRequired(true))
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
	/**
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 * @param {Client} client
	 */
	async execute(client, interaction) {
        try{
            interaction.deferReply({ ephemeral: true });
            const channel = interaction.options.getChannel('channel');
            let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
            if (!guildSettings) {
                guildSettings = new GuildSettings({
                    guildId: interaction.guild.id,
                });
            }
            let Options = guildSettings.TicketMenuOptions
            const selectMenu = new StringSelectMenuBuilder().setCustomId(`${interaction.guild.id}-ticket-menu`).setPlaceholder('🔒 Nothing Selected Yet.').addOptions(Options);
			let row = new ActionRowBuilder().addComponents(selectMenu);

			let embed = new EmbedBuilder().setDescription('Select an option to open a ticket. 👇').setFooter({ text: `⚡ Powered by ${interaction.guild.name}.` });
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
            
        }catch(e){console.log(e)}
    }}