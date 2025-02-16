const si = require("systeminformation");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: {
    name: "host",
    description:
      "Provides detailed system information including CPU, GPU, RAM, and OS.",
  },
  async execute(message) {
    try {
      const cpuInfo = await si.cpu();
      const memoryInfo = await si.mem();
      const memoryLayouts = await si.memLayout();
      const gpuInfo = await si.graphics();
      const osInfo = await si.osInfo();

      let osName;
      switch (true) {
        case osInfo.release.startsWith("14.5"):
          osName = "Sonoma";
          break;
        case osInfo.release.startsWith("13"):
          osName = "Ventura";
          break;
        case osInfo.release.startsWith("12"):
          osName = "Monterey";
          break;
        case osInfo.release.startsWith("11"):
          osName = "Big Sur";
          break;
        case osInfo.release.startsWith("10.15"):
          osName = "Catalina";
          break;
        default:
          osName = osInfo.distro || "Unknown";
          break;
      }

      var os = {
        name: osInfo.platform,
        release: osInfo.distro,
      };

      switch (os.name) {
        case "win32":
          os.name = "Windows";
          break;
        case "darwin":
          os.name = "macOS";
          break;
        case "linux":
          os.name = "Linux";
          break;
        default:
          os.name = osInfo.platform;
          break;
      }

      os.release = os.release.replace("nixos", "NixOS");
      os.release = os.release.replace("macos", "macOS");

      const osEmbed = new EmbedBuilder()
        .setTitle("🖥️ OS Information")
        .setColor("#00ff00")
        .setDescription(
          `**OS**\n${os.name}\n\n**Release**\n${os.release} (${osInfo.release})`,
        );

      const cpuEmbed = new EmbedBuilder()
        .setTitle("⚙️ CPU Information")
        .setColor("#ff0000")
        .setDescription(
          `**Model**\n${cpuInfo.brand}\n\n**Cores**\n${cpuInfo.cores}\n\n**Speed**\n${cpuInfo.speed} GHz`,
        );

      const totalRAM = memoryInfo.total / 1024 ** 3;
      const availableRAM = memoryInfo.available / 1024 ** 3;
      const freeRAM = memoryInfo.free / 1024 ** 3;
      const usedRAM = totalRAM - availableRAM;
      const ramEmbed = new EmbedBuilder()
        .setTitle("🛠 RAM Information")
        .setColor("#0000ff")
        .setDescription(
          `**Total RAM**\n${totalRAM.toFixed(2)} GB\n\n**Used RAM**\n${usedRAM.toFixed(2)} GB\n\n**Available RAM**\n${availableRAM.toFixed(2)} GB`,
        );

      const gpuEmbeds = gpuInfo.controllers.map((gpu, index) =>
        new EmbedBuilder()
          .setTitle(`🎮 GPU Information (GPU ${index + 1})`)
          .setColor("#ff00ff")
          .setDescription(
            `**Model**\n${gpu.model}\n\n**Memory**\n${gpu.memoryTotal ? `${gpu.memoryTotal / 1024 ** 2} MB` : "Unknown"
            }`,
          ),
      );

      // Create an array of all embeds
      const embeds = [osEmbed, cpuEmbed, ramEmbed, ...gpuEmbeds];

      // Create pagination buttons
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("prev")
          .setLabel("◀️")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("▶️")
          .setStyle(ButtonStyle.Primary),
      );

      let currentPage = 0;

      const embedMessage = await message.channel.send({
        embeds: [embeds[currentPage]],
        components: [row],
      });

      const filter = (interaction) => {
        return (
          ["prev", "next"].includes(interaction.customId) &&
          interaction.user.id === message.author.id
        );
      };

      const collector = embedMessage.createMessageComponentCollector({
        filter,
        time: 60000,
      });

      collector.on("collect", async (interaction) => {
        if (interaction.customId === "next") {
          currentPage = (currentPage + 1) % embeds.length;
        } else if (interaction.customId === "prev") {
          currentPage = (currentPage - 1 + embeds.length) % embeds.length;
        }

        await interaction.update({
          embeds: [embeds[currentPage]],
          components: [row],
        });
      });

      collector.on("end", async () => {
        const disabledRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("prev")
            .setLabel("◀️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("▶️")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        );

        await embedMessage.edit({ components: [disabledRow] }).catch(() => { });
      });
    } catch (error) {
      console.error("Error sending host information message:", error);
      await message.channel.send(
        "There was an error while retrieving system information.",
      );
    }
  },
};
