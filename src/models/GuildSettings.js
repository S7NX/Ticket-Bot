<<<<<<< HEAD
const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  CurrentTicketChannelNumber: { type: Number, default: 0o1 },
  PanelChannelID: { type: String, default: null },
  PanelMessageID: { type: String, default: null },
  TicketLogChannelID: { type: String, default: null },
  StaffRoleIDs: {type: Array, default: []},
  TicketCategory: {type: String, default: null},
  ClosedTicketCategory: {type: String, default: null},
  TicketMenuOptions: { type: Array, default: [    {
    "label": "Help Ticket",
    "value": "1232395082657693748-ticket-menu-help-ticket",
    "description": "Open a Ticket",
    "emoji": "🎫",
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
=======
const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  CurrentTicketChannelNumber: { type: Number, default: 0o1 },
  PanelChannelID: { type: String, default: null },
  PanelMessageID: { type: String, default: null },
  StaffRoleIDs: {type: Array, default: []},
  TicketCategory: {type: String, default: null},
  TicketMenuOptions: { type: Array, default: [    {
    "label": "Help Ticket",
    "value": "1232395082657693748-ticket-menu-help-ticket",
    "description": "Open a Ticket",
    "emoji": "🎫",
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
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
