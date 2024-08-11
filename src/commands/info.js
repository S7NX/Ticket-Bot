const { SlashCommandBuilder, EmbedBuilder, version } = require('discord.js');
const ms = require('pretty-ms');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Replies with the bot info!')
        .addSubcommand((subcommand) => subcommand.setName('bot').setDescription('Replies with the bot info!'))
        .addSubcommand((subcommand) => subcommand.setName('ping').setDescription('Replies with the bot ping!')),
    async execute(client, interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'ping') {
                await ping(interaction, client);
            } else if (subcommand === 'bot') {
                await sendBotInformation(interaction, client);
            }
        } catch (error) {
            console.error('Error executing command:', error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    },
};

async function ping(interaction, client) {
    try {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;
        await interaction.editReply(`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`);
    } catch (error) {
        console.error('Error in ping command:', error);
        await interaction.reply({ content: 'There was an error while executing the ping command!', ephemeral: true });
    }
}

async function sendBotInformation(interaction, client) {
    try {
        await interaction.deferReply();
        const reply = await interaction.fetchReply();
        const ping = reply.createdTimestamp - interaction.createdTimestamp;

        const totalMemory = (os.totalmem() / 1024 / 1024).toFixed(2);
        const freeMemory = (os.freemem() / 1024 / 1024).toFixed(2);
        const usedMemory = (totalMemory - freeMemory).toFixed(2);

        const embed = new EmbedBuilder()
            .setTitle(`Bot Information of ${interaction.client.user?.tag}`)
            .setColor('#2f3136')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .addFields(
                { name: 'Guilds:', value: `> \`\`${interaction.client.guilds.cache.size}\`\``, inline: true },
                { name: 'Users:', value: `> \`\`${interaction.client.users.cache.size}\`\``, inline: true },
                { name: 'Channels:', value: `> \`\`${interaction.client.channels.cache.size}\`\``, inline: true },
                { name: 'Cluster:', value: `> \`\`${client.cluster.id}\`\``, inline: true },
                { name: 'Uptime:', value: `> \`\`${ms(interaction.client.uptime, { long: true })}\`\``, inline: true },
                { name: 'Websocket:', value: `> \`\`${Math.round(interaction.client.ws.ping)}ms\`\``, inline: true },
                { name: 'Client Ping:', value: `> \`\`${Math.round(ping)}ms\`\``, inline: true },
                { name: 'Memory Usage:', value: `> \`\`${usedMemory}MB / ${totalMemory}MB\`\``, inline: true },
                { name: 'Commands:', value: `> \`\`${client.commands.size}\`\``, inline: true },
                { name: 'Node:', value: `> \`\`${process.version}\`\``, inline: true },
                { name: 'Discord.js:', value: `> \`\`${version}\`\``, inline: true },
                { name: 'OS:', value: `> \`\`${process.platform}\`\``, inline: true },
                { name: 'CPU:', value: `> \`\`${os.cpus()[0].model}\`\``, inline: true },
                { name: 'CPU Cores:', value: `> \`\`${os.cpus().length}\`\``, inline: true },
                { name: 'CPU Speed:', value: `> \`\`${os.cpus()[0].speed}MHz\`\``, inline: true },
            )
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }),
            });

        await interaction.editReply({embeds: [embed]});
    } catch (error) {
        console.error('Error in sendBotInformation command:', error);
        await interaction.editReply({ content: 'There was an error while executing the bot info command!', ephemeral: true });
    }
}