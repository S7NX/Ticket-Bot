const chalk = require("chalk");
module.exports = (client, error, id) => {
  console.log(
    ` ${chalk.blue("|| <==> ||")} [${chalk.green(
      String(new Date()).split(" ", 5).join(" "),
    )}] ${chalk.yellow("|| <==> ||")} ${chalk.red(
      "Shard #" + id + " Errored",
    )} ${chalk.yellow("|| <==> ||")}`,
  );
};
