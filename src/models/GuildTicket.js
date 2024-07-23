const mongoose = require("mongoose");

const GuildTicketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  TicketChannelId: { type: String },
  ticketUserID: { type: String },
  ticketID: { type: Number },
  claimUserId: { type: String },
  logMessageId: { type: String },
  TicketStatus: { type: String, default: "Open" },
  TicketEmbedMsgId: { type: String },
}

);

const GuildTicket = mongoose.model("GuildTicketSchema", GuildTicketSchema);

module.exports = GuildTicket;
