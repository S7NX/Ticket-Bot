const GuildSettings = require("../../models/GuildSettings");
const {
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

module.exports = async (client, interaction) => {
  try {
    if (interaction.isModalSubmit()) {
      if (interaction.customId === "setup") {
        const channelId = interaction.fields.getTextInputValue(
          "setup_modal_channel_input",
        );
        const description = interaction.fields.getTextInputValue(
          "setup_modal_description_input",
        );
        const image = interaction.fields.getTextInputValue(
          "setup_modal_img_input",
        );

        if (!interaction.guild.channels.cache.has(channelId)) {
          return interaction.reply({
            content: "Invalid Channel ID.",
            ephemeral: true,
          });
        }
        if (
          image.length > 0 &&
          !image.includes("https://cdn.discordapp.com/attachments/")
        ) {
          return interaction.reply({
            content:
              "Please use a Discord attachment link starting with ``https://cdn.discordapp.com/attachments/``",
            ephemeral: true,
          });
        }
        const guildId = interaction.guild.id;
        const guildSettings = await GuildSettings.findOne({ guildId: guildId });

        const preview = new ButtonBuilder()
          .setCustomId("previewdesc")
          .setLabel("Preview")
          .setStyle(ButtonStyle.Secondary);

        const test = new ButtonBuilder()
          .setCustomId("testdesc")
          .setLabel("Test")
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(test, preview);

        if (guildSettings) {
          if (guildSettings.partner !== channelId) {
            guildSettings.partner = channelId;
            guildSettings.desc = description;
            guildSettings.image = image;
            const channel = await client.channels.fetch(guildSettings.partner);
            channel.send(
              "This channel will now be used as the partner channel.",
            );
          }

          guildSettings.desc = description;
          guildSettings.partner = channelId;
          guildSettings.image = image;

          await guildSettings.save();

          await interaction.reply({
            content: "Successfully saved.",
            components: [row],
            ephemeral: true,
          });
        }

        if (!guildSettings) {
          const newGuildSettings = new GuildSettings({
            guildId: guildId,
            desc: description,
            partner: channelId,
          });

          await newGuildSettings.save();

          await interaction.reply({
            content: `Successfully saved.\nPartner Channel set to <#${newGuildSettings.partner}>`,
            components: [row],
          });

          const channel = await client.channels.fetch(newGuildSettings.partner);
          try {
            channel.send(
              "This channel will now be used as the partner channel.",
            );
          } catch (e) {
            await GuildSettings.deleteOne({ partner: channel.id });
            await interaction.followUp(
              `Partner Channel Deleted Due to Error: ${e}`,
            );
          }
        }
      }
    }

    if (interaction.isButton()) {
      if (interaction.customId === "previewdesc") {
        const guildSettings = await GuildSettings.findOne({
          guildId: interaction.guild.id,
        });
        const invite = await interaction.guild.channels.cache
          .get(guildSettings.partner)
          .createInvite();
        const joinbtn = new ButtonBuilder()
          .setLabel("Join")
          .setURL(invite.url)
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(joinbtn);
        const embed = new EmbedBuilder()
          .setTitle(interaction.guild.name)
          .setDescription(`${guildSettings.desc}`)
          .setColor("#2f3136")
          .setImage(guildSettings.image || null)
          .addFields({
            name: `Members: \`${interaction.guild.memberCount}\``,
            value: `Online: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "online",
              ).size
            }\` | Idle: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "idle",
              ).size
            }\` | DnD: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "dnd",
              ).size
            }\``,
            inline: false,
          })
          .setThumbnail(interaction.guild.iconURL())
          .setFooter({
            text: `Bumped by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          });

        interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });
      } else if (interaction.customId === "testdesc") {
        const guildSettings = await GuildSettings.findOne({
          guildId: interaction.guild.id,
        });
        const channel = interaction.guild.channels.cache.get(
          guildSettings.partner,
        );
        const invite = await interaction.guild.channels.cache
          .get(guildSettings.partner)
          .createInvite();
        const joinbtn = new ButtonBuilder()
          .setLabel("Join")
          .setURL(invite.url)
          .setStyle(ButtonStyle.Link);
        const row = new ActionRowBuilder().addComponents(joinbtn);
        const embed = new EmbedBuilder()
          .setTitle(interaction.guild.name)
          .setDescription(`${guildSettings.desc}`)
          .setColor("#2f3136")
          .setImage(guildSettings.image || null)
          .addFields({
            name: `Members: \`${interaction.guild.memberCount}\``,
            value: `Online: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "online",
              ).size
            }\` | Idle: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "idle",
              ).size
            }\` | DnD: \`${
              interaction.guild.presences.cache.filter(
                (p) => p.status === "dnd",
              ).size
            }\``,
            inline: false,
          })
          .setThumbnail(interaction.guild.iconURL())
          .setFooter({
            text: `Bumped by ${interaction.user.username}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
              format: "png",
              size: 2048,
            }),
          });

        let sent = await channel.send({
          embeds: [embed],
          components: [row],
          fetchReply: true,
        });

        await interaction.reply({
          content: `Successfully sent. https://discord.com/channels/${interaction.guild.id}/${guildSettings.partner}/${sent.id}`,
        });
      }
    }
  } catch (error) {
    console.log(error);
  }
};
