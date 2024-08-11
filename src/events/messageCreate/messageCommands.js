const GuildSettings = require('../../models/GuildSettings');
const GuildTicket = require('../../models/GuildTicket');
const { prefix, devs } = require('../../../config.json');
const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('pretty-ms');
const { exec } = require('child_process');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        let [cmdName, ...cmdArgs] = message.content.slice(prefix.length).trim().split(/\s+/);
        cmdName = cmdName.toLowerCase();

        try {
            switch (cmdName) {
                case 'help':
                    await handleHelpCommand(message);
                    break;
                case 'add':
                    await handleAddCommand(message, cmdArgs);
                    break;
                case 'remove':
                    await handleRemoveCommand(message, cmdArgs);
                    break;
                case 'ping':
                    await handlePingCommand(message, client);
                    break;
                case 'eval':
                    await handleEvalCommand(message, cmdArgs);
                    break;
                case 'close':
                    await handleCloseCommand(message);
                    break;
                case 'delete':
                    await handleDeleteCommand(message);
                    break;
                case 'uptime':
                    await handleUptimeCommand(message, client);
                    break;
                default:
                    return;
            }
        } catch (error) {
            console.error(error);
            await message.reply('There was an error trying to execute that command!');
        }
    }
};
async function handleHelpCommand(message) {
    try {
        const helpEmbed = new EmbedBuilder()
            .setColor('#8f82ff')
            .setTitle('Help')
            .setDescription('Here are the available commands:')
            .addFields(
                { name: 'Ticket Commands', value: '`add`, `remove`, `close`, `delete`', inline: false },
                { name: 'Utility Commands', value: '`ping`, `uptime`, `eval`', inline: false },
            );
        await message.reply({ embeds: [helpEmbed] });
    } catch (error) {
        console.error('Error in handleHelpCommand:', error);
    }
}

async function handleAddCommand(message, cmdArgs) {
    try {
        const ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
        if (!ticketInfo) return;

        if (cmdArgs.length < 1) return await message.reply('Please provide user IDs to add to the ticket!');

        for (const userId of cmdArgs) {
            try {
                const user = await message.guild.members.fetch(userId);
                const memberPermissions = message.channel.permissionsFor(user);
                if (memberPermissions && memberPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
                    await message.reply(`User ${user} is already in the ticket!`);
                    continue;
                }

                await message.channel.permissionOverwrites.create(user, {
                    [PermissionsBitField.Flags.ViewChannel]: true,
                    [PermissionsBitField.Flags.SendMessages]: true,
                    [PermissionsBitField.Flags.AttachFiles]: true,
                    [PermissionsBitField.Flags.EmbedLinks]: true,
                    [PermissionsBitField.Flags.AddReactions]: true,
                });

                await message.reply(`${user} has been added to the ticket!`);
            } catch (fetchError) {
                await message.reply(`User with ID ${userId} not found!`);
            }
        }
    } catch (error) {
        console.error('Error in handleAddCommand:', error);
    }
}

async function handleRemoveCommand(message, cmdArgs) {
    try {
        const ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
        if (!ticketInfo) return;

        if (cmdArgs.length < 1) return await message.reply('Please provide user IDs to remove from the ticket!');

        for (const userId of cmdArgs) {
            try {
                const user = await message.guild.members.fetch(userId);
                if (user.permissions.has(PermissionsBitField.Flags.Administrator)) {
                    await message.reply(`Cannot remove ${user} as they have Administrator permissions!`);
                    continue;
                }

                const memberPermissions = message.channel.permissionsFor(user);
                if (!memberPermissions || !memberPermissions.has(PermissionsBitField.Flags.ViewChannel)) {
                    await message.reply(`User ${user} is not in the ticket!`);
                    continue;
                }

                await message.channel.permissionOverwrites.delete(user);
                await message.reply(`${user} has been removed from the ticket!`);
            } catch (fetchError) {
                await message.reply(`User with ID ${userId} not found!`);
            }
        }
    } catch (error) {
        console.error('Error in handleRemoveCommand:', error);
    }
}

async function handlePingCommand(message, client) {
    try {
        const time = Date.now();
        const sentmsg = await message.reply('Pinging ...');
        await sentmsg.edit(`Bot Latency is \`${Date.now() - time}ms\`. API Latency is \`${Math.round(client.ws.ping)}ms\``);
    } catch (error) {
        console.error('Error in handlePingCommand:', error);
    }
}

async function handleEvalCommand(message, cmdArgs) {
    try {
        if (!devs.includes(message.author.id)) return;

        const code = message.content.includes('```') ? message.content.split('```js\n')[1].split('\n```')[0] : cmdArgs.join(' ');

        if (code.length < 1) return message.reply('Please provide code to evaluate!');

        try {
            const evaled = await eval(`(async () => { ${code} })()`);
            const fields = [
                { name: 'Input:', value: '```js\n' + `${code}` + '```', inline: false },
            ];
            if (evaled) {
                fields.push({ name: 'Output:', value: '```xl\n' + `${evaled}` + '```', inline: false });
            }

            const evalEmbed = new EmbedBuilder()
                .setColor('#8f82ff')
                .setTitle('Success')
                .addFields(fields);

            await message.reply({ embeds: [evalEmbed] });
        } catch (err) {
            await message.reply(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
        }
    } catch (error) {
        console.error('Error in handleEvalCommand:', error);
    }
}

async function handleCloseCommand(message) {
    try {
        const ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
        if (!ticketInfo) return;

        const confirm = new ButtonBuilder().setCustomId('close_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
        const cancel = new ButtonBuilder().setCustomId('close_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        await message.reply({ content: 'Are you sure you want to close this ticket?', components: [row] });
    } catch (error) {
        console.error('Error in handleCloseCommand:', error);
    }
}

async function handleDeleteCommand(message) {
    try {
        const ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
        if (!ticketInfo) return;

        const confirm = new ButtonBuilder().setCustomId('delete_confirm').setLabel('Confirm').setStyle(ButtonStyle.Danger);
        const cancel = new ButtonBuilder().setCustomId('delete_cancel').setLabel('Cancel').setStyle(ButtonStyle.Secondary);
        const row = new ActionRowBuilder().addComponents(confirm, cancel);

        await message.reply({ content: 'Are you sure you want to delete this ticket?', components: [row] });
    } catch (error) {
        console.error('Error in handleDeleteCommand:', error);
    }
}

async function handleUptimeCommand(message, client) {
    try {
        const uptime = ms(client.uptime, { long: true });
        await message.reply(`The bot has been online for ${uptime}`);
    } catch (error) {
        console.error('Error in handleUptimeCommand:', error);
    }
}

