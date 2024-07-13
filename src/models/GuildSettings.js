const mongoose = require("mongoose");

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  }
);

const GuildSettings = mongoose.model("GuildSettings", guildSettingsSchema);

module.exports = GuildSettings;
