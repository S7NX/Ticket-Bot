const mongoose = require("mongoose");

const GuildTicketSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  TicketChannelId: { type: String },
  TicketOwnerID: { type: String },
  


  }
);

const GuildTicket = mongoose.model("GuildTicketSchema", GuildTicketSchema);

module.exports = GuildTicket;
