const { ActivityType } = require("discord.js");
const { nFormatter } = require("../../handlers/functions");
const GuildSettings = require("../../models/GuildSettings");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  let status = [
    {
      name: `Football ⚽`,
      type: ActivityType.Playing,
    },
    {
      name: `Chess ♟️`,
      type: ActivityType.Playing,
    },
    {
      name: `Guitar 🎸`,
      type: ActivityType.Playing,
    },
    {
      name: `Minecraft 🎮`,
      type: ActivityType.Playing,
    },
    {
      name: `Basketball 🏀`,
      type: ActivityType.Playing,
    },
    {
      name: `Cooking Mama 👩‍🍳`,
      type: ActivityType.Playing,
    },

    {
      name: `Active Servers 🔥`,
      type: ActivityType.Watching,
    },
    {
      name: `Movies 🎬`,
      type: ActivityType.Watching,
    },
    {
      name: `TV Shows 📺`,
      type: ActivityType.Watching,
    },
    {
      name: `Anime 🍿`,
      type: ActivityType.Watching,
    },
    {
      name: `Wildlife 🐦`,
      type: ActivityType.Watching,
    },
    {
      name: `Paint Dry 🎨`,
      type: ActivityType.Watching,
    },

    {
      name: `Spotify 🎶`,
      type: ActivityType.Listening,
    },
    {
      name: `Jazz 🎷`,
      type: ActivityType.Listening,
    },
    {
      name: `Podcasts 🎧`,
      type: ActivityType.Listening,
    },
    {
      name: `Lofi Girl 🎶`,
      type: ActivityType.Listening,
    },
    {
      name: `Nature Sounds 🌿`,
      type: ActivityType.Listening,
    },
    {
      name: `Audiobooks 📚`,
      type: ActivityType.Listening,
    },

    {
      name: `Best Bots ${currentYear}.`,
      type: ActivityType.Competing,
    },
    {
      name: `Gym 💪`,
      type: ActivityType.Competing,
    },
    {
      name: `Esports 🎮`,
      type: ActivityType.Competing,
    },
    {
      name: `Chess Tournaments ♟️`,
      type: ActivityType.Competing,
    },
    {
      name: `Track and Field 🏃‍♂️`,
      type: ActivityType.Competing,
    },
    {
      name: `Dance Battles 💃`,
      type: ActivityType.Competing,
    },
    {
      name: `Spelling Bees 🐝`,
      type: ActivityType.Competing,
    },

    {
      name: `The Boys`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `GTA Online 🎮`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `Art Creation 🎨`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `Coding Sessions 💻`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `Live Music 🎵`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `Lofi Music 🎶`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
    {
      name: `Cooking Experiments 👩‍🍳`,
      type: ActivityType.Streaming,
      url: `https://twitch.tv/#`,
    },
  ];

  let random = Math.floor(Math.random() * status.length);
  let newstatus = status[random];
  const logmsg = `Status Set To ${newstatus.type}:${newstatus.name}`;

  client.user.setActivity(newstatus);

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    let newstatus = status[random];
    client.user.setActivity(newstatus);
    console.log(
      chalk.yellow(`Status Set To ${newstatus.type}:${newstatus.name}`),
    );
  }, 60000);
};
