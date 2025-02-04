import { Message, EmbedBuilder } from "discord.js";

export const data = {
  name: "ping",
  description: "Test replies.",
};

export const execute = async (message: Message): Promise<void> => {
  try {
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("🏓 Pinging...")
      .setDescription("Measuring latency...");

    const sentMessage = await message.reply({ embeds: [embed] });

    await new Promise((res) => setTimeout(res, 1000));

    const latency = sentMessage.createdTimestamp - message.createdTimestamp;
    const apiLatency = message.client.ws.ping;

    const updatedEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("🏓 Pong!")
      .setDescription(
        `**Bot Latency:** ${latency}ms\n**API Latency:** ${apiLatency}ms`
      );

    await sentMessage.edit({ embeds: [updatedEmbed] });
  } catch (error) {
    console.error("Error with ping command:", error);
  }
};
