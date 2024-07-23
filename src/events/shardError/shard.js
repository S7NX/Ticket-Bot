<<<<<<< HEAD
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
=======
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
>>>>>>> 8b72afe4fadbf08496257ba58b81b7550abb4d09
