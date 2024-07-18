const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { autoDeleteSlash } = require("../../../config.json");

module.exports = async (client) => {
  try {
    client.user.setActivity({ name: "Booting Up..." });
    const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);
    const clientId = client.user.id;

    console.log(chalk.yellow("Started refreshing application (/) commands."));

    // Delete all existing commands if the 'autoDeleteSlash' variable is set to true
    if (autoDeleteSlash) {
      await rest.put(Routes.applicationCommands(clientId), { body: [] });
      console.log(
        chalk.green(
          "Successfully deleted all existing application (/) commands.",
        ),
      );
    }

    const commands = [];
    client.commands = new Map(); // Create a new Map to store the commands

    const commandDir = `${process.cwd()}/src/commands`;

    function registerCommands(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });

      for (const file of files) {
        const filePath = path.join(dir, file.name);

        if (file.isDirectory()) {
          registerCommands(filePath); // Recursively register commands in subdirectories
        } else if (file.isFile() && file.name.endsWith(".js")) {
          const command = require(filePath);

          if ("data" in command && "execute" in command) {
            commands.push(command.data);
            client.commands.set(command.data.name, command);
          } else {
            console.log(
              chalk.yellow(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
              ),
            );
          }
        }
      }
    }

    registerCommands(commandDir);

    // Deploy or refresh the new commands
    await rest.put(Routes.applicationCommands(clientId), { body: commands });

    console.log(chalk.green("Successfully deployed (/) commands."));
  } catch (error) {
    console.log(chalk.red("There was an error: "), error, "\n");
  }
};
