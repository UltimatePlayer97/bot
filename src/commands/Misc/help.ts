import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import * as fs from "fs";
import * as path from "path";

export const data = {
  name: "help",
  description: "Displays a categorized list of commands.",
};

const commands = new Map<
  string,
  {
    data: { name: string; description: string };
    execute: (message: Message, args: string[]) => void;
  }
>();

function loadCommands(dir: string) {
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
            commands.set(fullPath, command);
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
}

loadCommands(path.join(__dirname, "../../commands"));

export const execute = async (message: Message): Promise<void> => {
  const categories: Record<string, { name: string; description: string }[]> =
    {};

  commands.forEach(({ data }, commandPath) => {
    const category = path.basename(path.dirname(commandPath));
    if (!categories[category]) categories[category] = [];
    categories[category].push({
      name: data.name,
      description: data.description,
    });
  });

  const options = Object.keys(categories).map((category) => ({
    label: category.charAt(0).toUpperCase() + category.slice(1),
    description: `View ${category} commands`,
    value: category,
  }));

  const embed = new EmbedBuilder()
    .setTitle("Help Menu")
    .setDescription("Select a category below to view available commands.")
    .setColor(0x5865f2);

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("help_menu")
    .setPlaceholder("Choose a category")
    .addOptions(options);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    selectMenu
  );

  const sentMessage = await message.reply({
    embeds: [embed],
    components: [row],
  });

  const filter = (interaction: any) =>
    interaction.isStringSelectMenu() &&
    interaction.user.id === message.author.id;
  const collector = sentMessage.createMessageComponentCollector({
    filter,
    time: 60000,
  });

  collector.on("collect", async (interaction: StringSelectMenuInteraction) => {
    const selectedCategory = interaction.values[0];
    const commandsList = categories[selectedCategory]
      .map((cmd) => `**${cmd.name}** - ${cmd.description}`)
      .join("\n");

    const categoryEmbed = new EmbedBuilder()
      .setTitle(
        `${
          selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
        } Commands`
      )
      .setDescription(commandsList)
      .setColor(0x5865f2);

    await interaction.update({ embeds: [categoryEmbed], components: [row] });
  });

  collector.on("end", () => {
    sentMessage.edit({ components: [] }).catch(() => {});
  });
};
