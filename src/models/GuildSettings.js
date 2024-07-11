const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  CurrentTicketChannelNumber: { type: String },
  TicketMenuOptions: { type: Array, default: [    {
    "label": "Help Ticket",
    "value": "1232395082657693748-ticket-menu-help-ticket",
    "description": "Open a Ticket",
    "emoji": "🎫"
  },
  {
    "label": "Report Ticket",
    "value": "1232395082657693748-ticket-menu-report-ticket",
    "description": "Open a Ticket",
    "emoji": "🎫"
  },] },
  EmbedOptions: {
    description: { type: String },
    image: { type: String },
    color: { type: String },
    footer: { type: String },
  },
  }
);

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);

module.exports = GuildSettings;
