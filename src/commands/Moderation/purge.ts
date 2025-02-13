import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const data = {
  name: "purge",
  description: "Bulk deletes a specified number of messages.",
};

export const execute = async (
  message: Message,
  args: string[] = []
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    const help_embed = new EmbedBuilder()
      .setTitle("Purge Command Usage")
      .setDescription(
        "`purge [number of messages]` - bulk deletes a specified amount of messages (up to 100)\n" +
          "`purge help` - Shows this help message."
      )
      .setColor("#5865f2");

    await message
      .reply({ embeds: [help_embed] })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  const num = parseInt(args[0]);
  const permission = message.member?.permissions.has(
    PermissionFlagsBits.ManageMessages
  );

  if (!permission) {
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You don't have permission to manage messages.")
            .setColor("#FF0000"),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (isNaN(num)) {
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Please provide a valid number.")
            .setColor("#FF0000"),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (num <= 0) {
    message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Please provide a number greater than 0.")
            .setColor("#FF0000"),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (num > 100) {
    message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Calm down, I can only delete up to 100 messages")
            .setColor("#FF0000"),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    const messages = await channel.bulkDelete(num + 1, true);
    const reply = await channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ Deleted ${num} messages.`)
          .setColor(0x00ff00),
      ],
    });

    setTimeout(() => {
      reply
        .delete()
        .catch((err) => console.error("Failed to delete reply:", err));
    }, 5000);
  } catch (error) {
    console.error(error);
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Failed to delete messages.")
            .setColor("#FF0000"),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
  }
};
