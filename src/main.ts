import { Client, GatewayIntentBits, Message } from "discord.js";
import db from "./drivers/database";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";
import chokidar from "chokidar";
import { general, secrets, roles } from "../config.json";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Map<
  string,
  {
    data: { name: string; description: string };
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

const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

const watcher = chokidar.watch(commandsPath, {
  persistent: true,
  ignored: /^\./,
  ignoreInitial: true,
});

watcher.on("add", (filePath) => {
  import(filePath).then((command) => {
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
      console.log(`Loaded new command: ${command.data.name}`);
    }
  });
});

watcher.on("change", (filePath) => {
  delete require.cache[require.resolve(filePath)];
  import(filePath).then((command) => {
    if (command.data && command.execute) {
      commands.set(command.data.name, command);
      console.log(`Reloaded command: ${command.data.name}`);
    }
  });
});

watcher.on("unlink", (filePath) => {
  const commandName = path.basename(filePath, path.extname(filePath));
  commands.delete(commandName);
  console.log(`Unloaded command: ${commandName}`);
});

client.once("ready", () => {
  console.log(`Bot is online!`);
  console.log(`Prefix: ${general.prefix}`);
  console.log(`Timezone: ${general.timezone}`);
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot) return;

  const afkReason = await db.getAFK(message.author.id);
  if (afkReason) {
    await db.removeAFK(message.author.id);
    message.reply(`Welcome back, ${message.author.displayName}!`);
  }

  if (!message.content.startsWith(general.prefix)) return;

  const args = message.content.slice(general.prefix.length).trim().split(/\s+/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName || !commands.has(commandName)) {
    if (!args[0]) {
      return;
    }
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

client.on("guildMemberAdd", async (member) => {
  try {
    const role = await member.guild.roles.fetch(roles.stoof_test);

    if (!role) {
      console.error(`Role with ID ${roles.stoof_test} not found.`);
      return;
    }

    await member.roles.add(role);
    console.log(`Added role ${role.name} to ${member.user.tag}`);
  } catch (error) {
    console.error("Failed to assign role:", error);
  }
});

client.on("guildMemberRemove", (member) => {
  console.log(`guildMemberRemove: ${member.id}`);
});

client.login(secrets.discord);
