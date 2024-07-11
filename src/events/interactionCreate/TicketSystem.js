const { PermissionsBitField, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = async (client, interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) return;

    // Extract the values from TicketMenuOptions for comparison
    const ticketMenuValues = guildSettings.TicketMenuOptions.map(option => option.value);

    if (!ticketMenuValues.includes(interaction.values[0])) {
        return interaction.reply({ content: "Invalid Ticket Menu Option", ephemeral: true });
    }
    const ticketOption = guildSettings.TicketMenuOptions.find(option => option.value === interaction.values[0]);
    interaction.deferReply({ ephemeral: true });

};


async function createTicket(interaction, existingGuildTicket, ticket_support_roles, categories, ticketOption) {
    try {

        let orderId = existingGuildTicket.CurrentTicketChannelNumber++;
        await existingGuildTicket.save();

        let ticketName = `${orderId}-${ticketOption.label}-${interaction.user.username}`.toLowerCase();
        let supportRoles = ticket_support_roles.map(x => ({
            id: x,
            allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.ManageMessages
            ]
        }));

        await interaction.reply({ content: `Creating ticket...`, ephemeral: true });

        if (interaction.guild.channels.cache.find(c => c.topic == interaction.user.id && c.name.includes("ticket"))) {
            return interaction.editReply({ content: `You have already created a ticket!`, ephemeral: true });
        }

        const createdChannel = await interaction.guild.channels.create({
            name: ticketName,
            type: ChannelType.GuildText,
            topic: `${interaction.user.id}`,
            parent: categories["IKARIAM-COURSE"],
            permissionOverwrites: [
                {
                    allow: [PermissionsBitField.Flags.ViewChannel],
                    deny: [
                        PermissionsBitField.Flags.SendMessages,
                        PermissionsBitField.Flags.AttachFiles,
                        PermissionsBitField.Flags.EmbedLinks
                    ],
                    id: interaction.user.id,
                },
                {
                    deny: PermissionsBitField.Flags.ViewChannel,
                    id: interaction.guild.id,
                },
                ...supportRoles
            ],
        });

        await GuildTicketSchema.create({
            ticketID: orderId,
            ticketChannel: createdChannel.id,
            GuildId: interaction.guild.id,
            ticketUserID: interaction.user.id,
            reviewPanelID: null,
            Order: 'IKARIAM-COURSE'
        });

        await interaction.editReply({ content: `Ticket created successfully in ${createdChannel}!`, ephemeral: true });

        setTimeout(async () => {
            await interaction.deleteReply();
        }, 60000);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji("🔒")
                    .setCustomId("ticket-close"),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji("🗑️")
                    .setCustomId("ticket-delete")
            );

        const embed = new EmbedBuilder()
            .setDescription(`# <:T_:1232674301333864540> Ticket: ${ticketOption.label} \n\n ## <:T_:1232674301333864540> <:T_:1232674301333864540> <:T_:1232674301333864540> by: <@!${interaction.user.id}>`)
            .setColor(existingGuildTicket.EmbedOptions.color)
            .setImage(existingGuildTicket.EmbedOptions.image || null)
            .setFooter(existingGuildTicket.EmbedOptions.footer || null);

        await createdChannel.send({ content: `${ticket_support_roles.map((m) => `<@&${m}>`).join(", ")}. New Ticket!`, embeds: [embed], components: [row] });

    } catch (error) {
        console.error("Error creating ticket:", error);
        await interaction.reply({ content: `An error occurred while creating the ticket. Please try again later.`, ephemeral: true });
    }
}
