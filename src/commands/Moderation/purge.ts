import { Message, PermissionFlagsBits, TextChannel } from "discord.js";
import { parse } from "dotenv";

export const data = {
  name: "purge",
  description: "Bulk deletes a specified number of messages.",
  category: "Moderation",
};

export const execute = async (
  message: Message,
  args: string[] = [],
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    await message.reply(
      "**Purge Command Usage:**\n" +
        "`purge [number of messages]` - bulk deletes a specified amount of messages (up to 100).\n" +
        "`purge help` - Shows this help message.",
    );
    return;
  }

  const num = parseInt(args[0]);
  const permission = message.member?.permissions.has(
    PermissionFlagsBits.ManageMessages,
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
    await message.reply(`✅ Deleted ${num} messages.`);
  } catch (error) {
    console.error(error);
    await message.reply(
      "❌ Failed to delete messages. Ensure messages are not older than 14 days.",
    );
  }
};
