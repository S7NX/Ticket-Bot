const { ClusterManager } = require("discord-hybrid-sharding");
const chalk = require("chalk");
const OS = require("os");
const config = require("./config.json");

const manager = new ClusterManager(`./src/index.js`, {
  totalShards: 1, // or 'auto'
  shardsPerClusters: 1,
  mode: "process", // you can also choose "worker"
  token: process.env.TOKEN,
  respawn: true,
});

manager.on("clusterCreate", (cluster) => {
  console.log(
    `${chalk.magenta("[SHARDING-MANAGER]:")} Launched Cluster #${
      cluster.id
    } | ${cluster.id + 1}/${cluster.manager.totalClusters} [${
      cluster.manager.shardsPerClusters
    }/${cluster.manager.totalShards} Shards]`.green,
  );

  cluster.on("death", function () {
    console.log(chalk.red.bold(`Cluster ${cluster.id} died..`));
  });

  cluster.on("message", async (msg) => {
    if (!msg._sCustom) return;
    if (msg.dm) {
      const { interaction, message, dm, packet } = msg;
      await manager.broadcast({ interaction, message, dm, packet });
    }
  });

  cluster.on("error", (e) => {
    console.log(chalk.red.bold(`Cluster ${cluster.id} errored..`));
    console.error(e);
  });

  cluster.on("disconnect", function () {
    console.log(chalk.red.bold(`Cluster ${cluster.id} disconnected..`));
  });

  cluster.on("reconnecting", function () {
    console.log(chalk.yellow.bold(`Cluster ${cluster.id} reconnecting..`));
  });

  cluster.on("close", function (code) {
    console.log(
      chalk.red.bold(`Cluster ${cluster.id} closed with code ${code}`),
    );
  });

  cluster.on("exit", function (code) {
    console.log(
      chalk.red.bold(`Cluster ${cluster.id} exited with code ${code}`),
    );
  });
});

manager.on("clientRequest", async (message) => {
  if (message._sRequest && message.songRequest) {
    if (message.target === 0 || message.target) {
      const msg = await manager.clusters
        .get(message.target)
        .request(message.raw);
      message.reply(msg);
    } else {
      manager.clusters.forEach(async (cluster) => {
        const msg = await cluster.request(message.raw);
        message.reply(msg);
      });
    }
  }
});

// Log the creation of the debug
manager.once("debug", (d) =>
  d.includes("[CM => Manager] [Spawning Clusters]") ? console.log(d) : "",
);

manager.spawn({ timeout: -1 });
