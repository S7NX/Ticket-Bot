require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const eventHandler = require("./handlers/eventHandler");
const chalk = require("chalk");
const { ClusterClient, getInfo } = require("discord-hybrid-sharding");

const client = new Client({
  shards: getInfo().SHARD_LIST,
  shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
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
    console.log(chalk.red(`Error:`,  error));
  }

