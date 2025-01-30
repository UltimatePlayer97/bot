import { Client, GatewayIntentBits, Message } from "discord.js";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import chokidar from "chokidar";
import { general } from "../config.json";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Map<
  string,
  {
    data: { name: string };
    execute: (message: Message, args: string[]) => void;
  }
>();

const loadCommands = (dir: string): void => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".js")) {
      import(fullPath)
        .then((command) => {
          if (command.data && command.execute) {
            commands.set(command.data.name, command);
            console.log(`Loaded command: ${command.data.name}`);
          } else {
            console.error(`Invalid command structure in: ${file}`);
          }
        })
        .catch((err) => {
          console.error(`Error loading command from ${file}: ${err}`);
        });
    }
  });
};

loadCommands(path.join(__dirname, "commands"));
const watcher = chokidar.watch(path.join(__dirname, "commands"), {
  persistent: true,
  ignored: /^\./,
  ignoreInitial: true,
});

watcher.on("add", (filePath) => {
  const commandName = path.basename(filePath, ".ts");
  import(filePath).then((command) => {
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
      console.log(`Loaded new command: ${command.data.name}`);
    }
  });
});

watcher.on("change", (filePath) => {
  const commandName = path.basename(filePath, ".ts");
  delete require.cache[require.resolve(filePath)];
  import(filePath).then((command) => {
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
      console.log(`Reloaded command: ${command.data.name}`);
    }
  });
});

watcher.on("unlink", (filePath) => {
  const commandName = path.basename(filePath, ".ts");
  commands.delete(commandName);
  console.log(`Unloaded command: ${commandName}`);
});

client.once("ready", () => {
  console.log(`Bot is online!`);
  console.log(`Prefix: ${general.prefix}`);
  console.log(`Timezone: ${general.timezone}`);
});

client.on("messageCreate", (message: Message) => {
  if (!message.content.startsWith(general.prefix) || message.author.bot) return;

  const args = message.content.slice(general.prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName || !commands.has(commandName)) {
    message.reply("Command not found.");
    return;
  }

  const command = commands.get(commandName);
  if (command) {
    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply("There was an error executing that command!");
    }
  }
});

client.login(process.env.TOKEN);
