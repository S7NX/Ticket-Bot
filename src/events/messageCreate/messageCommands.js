const GuildSettings = require('../../models/GuildSettings');
const GuildTicket = require('../../models/GuildTicket');
const { prefix, devs } = require('../../../config.json');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
let Discord = require('discord.js');

module.exports = async (client, message) => {
    if (message.author.bot) return;

    if (message.content.startsWith(prefix)) {
        const [cmdName, ...cmdArgs] = message.content.slice(prefix.length).trim().split(/\s+/);

        try {
            if (cmdName === 'help') {
                let helpEmbed = new EmbedBuilder()
                    .setColor('#8f82ff')
                    .setTitle('Help')
                    .setDescription('Here are the available commands:')
                    .addFields(
                        { name: 'add', value: 'Add a user to the ticket', inline: false },
                        { name: 'remove', value: 'Remove a user from the ticket', inline: false },
                        { name: 'ping', value: 'Check the bot\'s latency', inline: false },
                        { name: 'eval', value: 'Evaluate JavaScript code', inline: false },
                    );
                await message.reply({ embeds: [helpEmbed] });
            } else if (cmdName === 'add') {
                let ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
                if (!ticketInfo) return;

                if (cmdArgs.length < 1) return await message.reply('Please provide user IDs to add to the ticket!');

                for (const userId of cmdArgs) {
                    let user;
                    try {
                        user = await message.guild.members.fetch(userId);
                    } catch (fetchError) {
                        await message.reply(`User with ID ${userId} not found!`);
                        continue;
                    }
                    
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
                }
            } else if (cmdName === 'remove') {
                let ticketInfo = await GuildTicket.findOne({ TicketChannelId: message.channel.id });
                if (!ticketInfo) return;

                if (cmdArgs.length < 1) return await message.reply('Please provide user IDs to remove from the ticket!');

                for (const userId of cmdArgs) {
                    let user;
                    try {
                        user = await message.guild.members.fetch(userId);
                    } catch (fetchError) {
                        await message.reply(`User with ID ${userId} not found!`);
                        continue;
                    }

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
                }
            } else if (cmdName === 'ping') {
                let time = Date.now();
                let sentmsg = await message.reply('Pinging ...');
                await sentmsg.edit(`Bot Latency is \`\`${Date.now() - time}ms\`\`. API Latency is \`\`${Math.round(client.ws.ping)}ms\`\``);
            } else if (cmdName === 'eval') {
                if (!devs.includes(message.author.id)) return;
                
                // Extract the code to evaluate
                let args;
                if (message.content.includes('```')) {
                    // Multi-line code block
                    args = message.content.split('```js\n')[1].split('\n```')[0];
                } else {
                    // Single-line code
                    args = message.content.split(' ').slice(1).join(' ');
                }
            
                if (args.length < 1) return message.reply('Please provide code to evaluate!');
                
                try {
                    let evaled = await eval(`(async () => { ${args} })()`);
                    let feilds = [
                        { name: 'Input:', value: '```js\n' + `${args}` + '```', inline: false },
                    ]
                    if (evaled) {
                        feilds.push({ name: 'Output:', value: '```xl\n' + evaled + '```', inline: true });
                    }
                    let sesa = new EmbedBuilder()
                        .setColor('#8f82ff')
                        .setTitle('Success')
                        .setFields(feilds
                        );
                    message.reply({ embeds: [sesa] });
                } catch (err) {
                    message.reply(`\`ERROR\` \`\`\`xl\n${err}\n\`\`\``);
                }
            }
            
            
        } catch (error) {
            console.error(error);
            await message.reply('There was an error trying to execute that command!');
        }
    }
};
