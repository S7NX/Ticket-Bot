const chalk = require("chalk");
module.exports = (client, id, replayedEvents) => {
  console.log(
    ` ${chalk.blue("|| <==> ||")} [${chalk.green(
      String(new Date()).split(" ", 5).join(" "),
    )}] ${chalk.yellow("|| <==> ||")} ${chalk.cyan(
      "Shard #" + id + " Resumed",
    )} ${chalk.yellow("|| <==> ||")}`,
  );
};
