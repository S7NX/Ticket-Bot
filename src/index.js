require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const chalk = require("chalk");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");

const { SHARD_LIST, TOTAL_SHARDS } = getInfo();

const client = new Client({
  shards: SHARD_LIST,
  shardCount: TOTAL_SHARDS,
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.MessageContent,
  ],
});

try {
  eventHandler(client);

  client.cluster = new ClusterClient(client);
  client.login(process.env.TOKEN);
} catch (error) {
  console.error(chalk.red('Error:', error));
}