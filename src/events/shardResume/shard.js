<<<<<<< HEAD
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
=======
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
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
