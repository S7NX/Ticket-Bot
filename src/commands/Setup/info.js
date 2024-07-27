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
		const subcommand = interaction.options.getSubcommand();
		if (subcommand === 'ping') {
            ping(interaction, client);
		} else if (subcommand === 'bot') {
            sendBotInformation(interaction, client, ms, version, os)
        }
	},
};

async function ping(interaction, client) {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(`Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`);
}
async function sendBotInformation(interaction, client, ms, version, os) {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    await interaction.editReply({
        embeds: [
            new EmbedBuilder()
                .setTitle(`Bot Information of ${interaction.client.user?.tag}`)
                .setColor('#2f3136')
                .addFields(
                    // General Information
                    {
                        name: 'Guilds:',
                        value: `> \`\`${interaction.client.guilds.cache.size}\`\``,
                        inline: true,
                    },
                    {
                        name: 'Users:',
                        value: `> \`\`${interaction.client.users.cache.size}\`\``,
                        inline: true,
                    },
                    {
                        name: 'Channels:',
                        value: `> \`\`${interaction.client.channels.cache.size}\`\``,
                        inline: true,
                    },
                    {
                        name: 'Cluster:',
                        value: `> \`\`${client.cluster.id}\`\``,
                        inline: true,
                    },
                    // Performance Metrics
                    {
                        name: 'Uptime:',
                        value: `> \`\`${ms(interaction.client.uptime, { long: true })}\`\``,
                        inline: true,
                    },
                    {
                        name: 'Websocket:',
                        value: `> \`\`${Math.round(interaction.client.ws.ping)}ms\`\``,
                        inline: true,
                    },
                    {
                        name: 'Client Ping:',
                        value: `> \`\`${Math.round(ping)}ms\`\``,
                        inline: true,
                    },
                    {
                        name: 'Memory:',
                        value: `> \`\`${(process.memoryUsage().heapUsed / 900 / 900).toFixed(2)}MB\`\``,
                        inline: true,
                    },
                    // Command Information
                    {
                        name: 'Commands:',
                        value: `> \`\`${client.commands.size}\`\``,
                        inline: true,
                    },
                    // System Information
                    {
                        name: 'Node:',
                        value: `> \`\`${process.version}\`\``,
                        inline: true,
                    },
                    {
                        name: 'Discord.js:',
                        value: `> \`\`${version}\`\``,
                        inline: true,
                    },
                    {
                        name: 'OS:',
                        value: `> \`\`${process.platform}\`\``,
                        inline: true,
                    },
                    {
                        name: 'CPU:',
                        value: `> \`\`${os.cpus()[0].model}\`\``,
                        inline: true,
                    },
                    {
                        name: 'CPU Cores:',
                        value: `> \`\`${os.cpus().length}\`\``,
                        inline: true,
                    },
                    {
                        name: 'CPU Speed:',
                        value: `> \`\`${os.cpus()[0].speed}MHz\`\``,
                        inline: true,
                    }
                )
                .setFooter({
                    text: `Requested by ${interaction.user.username}`,
                    iconURL: interaction.user.displayAvatarURL({
                        dynamic: true,
                        format: 'png',
                        size: 2048,
                    }),
                }),
        ],
    });
}
