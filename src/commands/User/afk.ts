import { Message, EmbedBuilder } from "discord.js";
import db from "../../drivers/database";

export const data = {
  name: "afk",
  description: "Set an AFK status with a reason.",
};

export const execute = async (message: Message, args: string[]): Promise<void> => {
  try {
    const reason = args.join(" ") || "I'm currently AFK.";
    const userId = message.author.id;

    // Set AFK status in database
    await db.setAFK(userId, reason);

    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("💤 AFK Set")
      .setDescription(`You are now AFK: **${reason}**`);

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error("Error with AFK command:", error);
  }
};

// ** Check messages for AFK users & remove AFK status if they send a message **
export const checkAFK = async (message: Message): Promise<void> => {
  try {
    const userId = message.author.id;
    const afkReason = await db.getAFK(userId);

    if (afkReason) {
      await db.removeAFK(userId);
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ AFK Removed")
        .setDescription("Welcome back! Your AFK status has been removed.");
      await message.reply({ embeds: [embed] });
    }

    // Check mentions for AFK users
    if (message.mentions.users.size > 0) {
      for (const [, user] of message.mentions.users) {
        const mentionedAFK = await db.getAFK(user.id);
        if (mentionedAFK) {
          const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle("💤 User is AFK")
            .setDescription(`**${user.username}** is AFK: ${mentionedAFK}`);
          await message.reply({ embeds: [embed] });
        }
      }
    }
  } catch (error) {
    console.error("Error checking AFK status:", error);
  }
};

