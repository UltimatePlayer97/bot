import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";
import { parse } from "dotenv";

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

    await message.reply({ embeds: [help_embed] });
    return;
  }

  const num = parseInt(args[0]);
  const permission = message.member?.permissions.has(
    PermissionFlagsBits.ManageMessages
  );

  if (!permission) {
    await message.reply("❌ You don't have permission to manage messages.");
    return;
  }

  if (isNaN(num)) {
    await message.reply("❌ Please provide a valid number.");
    return;
  }

  if (num === 0) {
    message.reply("I can't delete 0 messages.");
    return;
  }

  if (num > 100) {
    message.reply("Calm down, I can only delete up to 100 messages");
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    const messages = await channel.bulkDelete(num, true);
    await channel.send({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ Deleted ${num} messages.`)
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply(
      "❌ Failed to delete messages. Ensure messages are not older than 14 days."
    );
  }
};
