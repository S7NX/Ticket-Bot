const chalk = require("chalk");
module.exports = (client, id) => {
  console.log(
    ` ${chalk.blue("|| <==> ||")} [${chalk.green(
      String(new Date()).split(" ", 5).join(" "),
    )}] ${chalk.yellow("|| <==> ||")} ${chalk.magenta(
      "Shard #" + id + " Reconnecting",
    )} ${chalk.yellow("|| <==> ||")}`,
  );
};
