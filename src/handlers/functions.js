const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  Guild,
} = require("discord.js");
const GuildSettings = require("../models/GuildSettings");

module.exports = {
  nFormatter,
};







function nFormatter(num, digits) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const i = si.findIndex((x) => num < x.value);

  return (
    (num / si[i - 1].value).toFixed(digits).replace(rx, "$1") + si[i - 1].symbol
  );
}
