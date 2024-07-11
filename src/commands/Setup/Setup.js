const {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  Client,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');

module.exports = {
  data: new SlashCommandBuilder().setName('setup').setDescription('Setup Ticket Menu.'),
  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(client, interaction) {
    let guildSettings = await GuildSettings.findOne({ guildId: interaction.guild.id });
    if (!guildSettings) {
      guildSettings = new GuildSettings({
        guildId: interaction.guild.id,
      });
      await guildSettings.save();
    }

    if (guildSettings.TicketMenuChannelID) {
      return interaction.reply({
        content: 'The Ticket Menu has already been setup.',
        ephemeral: true,
      });
    }

    let customid = `${interaction.guild.id}-ticket-menu`;
    let Options;

    if (
      Array.isArray(guildSettings.TicketMenuOptions) &&
      guildSettings.TicketMenuOptions.length > 0
    ) {
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

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(customid)
      .setPlaceholder('🔒 Nothing Selected Yet.')
      .addOptions(Options);
    let row = new ActionRowBuilder().addComponents(selectMenu);

    let embed = new EmbedBuilder()
      .setDescription('Select an option to open a ticket. 👇')
      .setFooter({ text: `⚡ Powered by ${interaction.guild.name}.` });
    if(guildSettings.EmbedOptions){
      if(guildSettings.EmbedOptions.description) embed.setDescription(guildSettings.EmbedOptions.description);
      if(guildSettings.EmbedOptions.color) embed.setColor(guildSettings.EmbedOptions.color);
      if(guildSettings.EmbedOptions.image) embed.setImage({ url: guildSettings.EmbedOptions.image});
      if(guildSettings.EmbedOptions.footer) embed.setFooter({ text: guildSettings.EmbedOptions.footer });
    }
    let addBtn = new ButtonBuilder()
      .setLabel('Add Option')
      .setCustomId('add-option')
      .setStyle(ButtonStyle.Primary);

    let removeBtn = new ButtonBuilder()
      .setLabel('Remove Option')
      .setCustomId('remove-option')
      .setStyle(ButtonStyle.Danger);

    let editBtn = new ButtonBuilder()
      .setLabel('Edit Embed')
      .setCustomId('edit-embed')
      .setStyle(ButtonStyle.Secondary);
    let confirmBtn = new ButtonBuilder()
      .setLabel('Finish Setup')
      .setCustomId('confrim-button')
      .setStyle(ButtonStyle.Success);

    // Send the embed with the select menu
    let embedMsg = await interaction.channel.send({ embeds: [embed], components: [row],  });

    // Create a new row with buttons
    let buttonRow = new ActionRowBuilder().addComponents(addBtn, removeBtn, editBtn, confirmBtn);

    // Reply to the interaction with the buttons
    let btnMsg = await interaction.reply({ components: [buttonRow], ephemeral: true });
    let filter = (i) => i.isButton() && i.user.id === interaction.user.id;
    let collector = btnMsg.createMessageComponentCollector({ filter, idle: 60000 });

    collector.on('collect', async (i) => {
      switch (i.customId) {
        case `add-option`:
          await add_option(i, embedMsg, customid, Options, guildSettings);
          break;
        case `remove-option`:
          await remove_option(i, embedMsg, customid, Options, guildSettings);
          break;
        case `edit-embed`:
          await edit_embed(i, embedMsg, customid, Options, guildSettings);
          break;
        case `confrim-button`:
          await confrim_button(i, collector, btnMsg );
          break;
        default:
          break;
      }
      //collector.stop();
    });
  },
};
//functions
async function add_option(interaction, embedMsg, customid, Options, guildSettings) {
  if (!interaction) return;
  let modal = new ModalBuilder().setCustomId(`addBtn-modal`).setTitle('Add Option');
  let optionName = new TextInputBuilder()
    .setCustomId(`addBtn-modal-input-name`)
    .setLabel('Option Name')
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(100)
    .setRequired(true);
  let optionDescription = new TextInputBuilder()
    .setCustomId(`addBtn-modal-input-description`)
    .setMinLength(1)
    .setMaxLength(100)
    .setLabel('Option Description')
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(false);
  let optionEmoji = new TextInputBuilder()
    .setCustomId(`addBtn-modal-input-emoji`)
    .setLabel('Option Emoji')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);
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
      let optionDescription = await ModalInteraction.fields.getTextInputValue(
        'addBtn-modal-input-description'
      );
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
      let modalrow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().addOptions(Options).setCustomId(customid)
      );
      embedMsg.edit({ components: [modalrow] });
      ModalInteraction.reply({ content: 'Option Added.', ephemeral: true });
      guildSettings.TicketMenuOptions = Options;
      await guildSettings.save();
    })
    .catch(console.error);
}

async function remove_option(interaction, embedMsg, customid, Options, guildSettings) {
  if (!interaction) return;
  let modal = new ModalBuilder().setCustomId(`removeBtn-modal`).setTitle('Remove Option');
  let optionNumber = new TextInputBuilder()
    .setCustomId(`removeBtn-modal-input-number`)
    .setLabel('Option Name')
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(1)
    .setPlaceholder(`1 - ${Options.length}`)
    .setRequired(true);
  const modalrow1 = new ActionRowBuilder().addComponents(optionNumber);
  modal.addComponents(modalrow1);
  await interaction.showModal(modal);
  let Modalfilter = (ModalInteraction) => ModalInteraction.customId === 'addBtn-modal';
  interaction.awaitModalSubmit({ Modalfilter, time: 60_000 }).then(async (ModalInteraction) => {
    let optionNumber = await ModalInteraction.fields.getTextInputValue(
      'removeBtn-modal-input-number'
    );
    if (isNaN(optionNumber)) {
      return ModalInteraction.reply({ content: 'Please enter a valid number.', ephemeral: true });
    }
    let index = parseInt(optionNumber) - 1;
    if (index >= 0 && index < Options.length) {
      Options.splice(index, 1);
      let modalrow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().addOptions(Options).setCustomId(customid)
      );
      embedMsg.edit({ components: [modalrow] });
      ModalInteraction.reply({ content: 'Option Removed.', ephemeral: true });
      guildSettings.TicketMenuOptions = Options;
      await guildSettings.save();
    } else {
      ModalInteraction.reply({ content: 'Please enter a valid number.', ephemeral: true });
    }
  });
}

async function edit_embed(interaction, embedMsg, customid, Options, guildSettings) {
  if (!interaction) return;

  let embedData = embedMsg.embeds[0].data; // Accessing the embed object directly

  let modal = new ModalBuilder().setCustomId(`editEmbed-modal`).setTitle('Edit Embed');

  let embedDescription = new TextInputBuilder()
    .setCustomId(`editBtn-modal-input-description`)
    .setLabel('Embed Description')
    .setStyle(TextInputStyle.Paragraph)
    .setMinLength(1)
    .setMaxLength(4000)
    .setRequired(true);

  let embedImage = new TextInputBuilder()
    .setCustomId(`editBtn-modal-input-image`)
    .setLabel('Embed Image')
    .setStyle(TextInputStyle.Short)
    .setRequired(false);

  let embedColor = new TextInputBuilder()
    .setCustomId(`editBtn-modal-input-color`)
    .setLabel('Embed Color')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Hex color code')
    .setMaxLength(7)
    .setMinLength(7)
    .setRequired(false);

  let embedFooter = new TextInputBuilder()
    .setCustomId(`editBtn-modal-input-footer`)
    .setLabel('Embed Footer')
    .setStyle(TextInputStyle.Short)
    .setMinLength(1)
    .setMaxLength(2048)
    .setRequired(false);

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
    interaction
      .awaitModalSubmit({ filter: Modalfilter, time: 60_000 })
      .then(async (ModalInteraction) => {
        let newEmbed = {
          description: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-description'),
          image: {
            url: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-image') || null,
          },
          color:
            parseInt(
              ModalInteraction.fields
                .getTextInputValue('editBtn-modal-input-color')
                .replace('#', ''),
              16
            ) || null,
          footer: {
            text: ModalInteraction.fields.getTextInputValue('editBtn-modal-input-footer') || null,
          },
        };
        console.log(newEmbed)
        // Update the embed
        await embedMsg.edit({ embeds: [newEmbed] });

        await ModalInteraction.reply({
          content: 'Embed updated successfully.',
          ephemeral: true,
        });

        // Update guild settings
        guildSettings.EmbedOptions.description = newEmbed.description;
        guildSettings.EmbedOptions.color = ModalInteraction.fields
        .getTextInputValue('editBtn-modal-input-color');
        guildSettings.EmbedOptions.Image = newEmbed.image.url;
        guildSettings.EmbedOptions.footer = newEmbed.footer.text;
        await guildSettings.save();
      });
  } catch (error) {
    console.error('Error editing embed:', error);
    await interaction.reply({
      content: 'An error occurred while editing the embed.',
      ephemeral: true,
    });
  }
}
async function confrim_button(interaction, collector, btnMsg) {
  if (!interaction) return;
  await btnMsg.delete();
  await interaction.reply({ content: 'Ticket Menu Setup Complete. Use `/ticket send-panel` to send it to a Spefic Channel or Directly use it from here.', ephemeral: true });
  await collector.stop();
}