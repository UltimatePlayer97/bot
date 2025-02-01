import { Message, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export const data = {
  name: "botinfo",
  description: "Get information about the bot and its codebase.",
};

const formatUptime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const execute = async (
  message: Message,
  args: string[]
): Promise<void> => {
  try {
    const botStats = getBotStats(__dirname + "/" + "../");
    const uptime = formatUptime(message.client.uptime || 0);
    const embed = new EmbedBuilder()
      .setColor("#ff5733")
      .setTitle("Bot Information")
      .setDescription("Detailed stats about the bot and its codebase.")
      .addFields(
        {
          name: "Total Files",
          value: `\`\`${botStats.totalFiles}\`\``,
          inline: true,
        },
        {
          name: "Total Folders",
          value: `\`\`${botStats.totalFolders}\`\``,
          inline: true,
        },
        {
          name: "Total Lines of Code",
          value: `\`\`${botStats.totalLines}\`\``,
          inline: true,
        },
        {
          name: "Total Functions",
          value: `\`\`${botStats.totalFunctions}\`\``,
          inline: true,
        },
        {
          name: "Uptime",
          value: `\`\`${uptime}\`\``,
          inline: true,
        }
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Error fetching bot info:", error);
    await message.reply("An error occurred while fetching bot information.");
  }
};

const getBotStats = (dirPath: string) => {
  let totalFiles = 0;
  let totalFolders = 0;
  let totalLines = 0;
  let totalFunctions = 0;

  const traverseDirectory = (currentPath: string) => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        totalFolders++;
        traverseDirectory(entryPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".js") || entry.name.endsWith(".ts"))
      ) {
        totalFiles++;
        const fileContent = fs.readFileSync(entryPath, "utf-8");
        totalLines += fileContent.split("\n").length;

        const functionMatches =
          fileContent.match(
            /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|\w+\s*:\s*\(.*?\)\s*=>|class\s+\w+|constructor\s*\(|\w+\s*\(.*?\)\s*{/g
          ) || [];
        totalFunctions += functionMatches.length;
      }
    }
  };

  traverseDirectory(dirPath);

  return {
    totalFiles,
    totalFolders,
    totalLines,
    totalFunctions,
  };
};
