import { Message, PermissionFlagsBits, Client } from "discord.js";

export const data = {
  name: "ban",
  description: "Ban a user from the server.",
};

export const execute = async (
  message: Message,
  args: string[] = [],
): Promise<void> => {
  if (!message || !message.member || !message.guild) {
    console.error("❌ Invalid message object received:", message);
    return;
  }

  console.log("✅ Ban command executed by:", message.author.tag, "Args:", args);

  if (args[0]?.toLowerCase() === "help") {
    await message.reply(
      "**Ban Command Usage:**\n" +
        "`ban user [reason]` - Bans the mentioned user with an optional reason.\n" +
        "`ban help` - Shows this help message.",
    );
    return;
  }

  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message.reply("❌ You don't have permission to ban members.");
    return;
  }

  let target;
  if (message.mentions.members?.first()) {
    target = message.mentions.members.first();
  } else {
    const user_id = args[0];
    if (user_id) {
      try {
        target = await message.guild.members.fetch(user_id);
      } catch (error) {
        await message.reply("❌ User ID not found.");
        return;
      }
    }
  }

  if (!target) {
    await message.reply("❌ Please mention a user to ban.");
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)
  ) {
    await message.reply("❌ I don't have permission to ban members.");
    return;
  }

  if (!target.bannable) {
    await message.reply(
      "❌ I can't ban this user. They may have a higher role than me.",
    );
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    await target
      .send(`🚫 You were banned in ${message.guild.name}. | Reason: ${reason}`)
      .catch(() =>
        console.log(
          `❌ Failed to DM ${target.user.tag}. They may have DMs disabled.`,
        ),
      );

    await target.ban({ reason });
    await message.reply(
      `✅ **${target.user.tag}** has been banned. | Reason: **${reason}**`,
    );
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to ban user.");
  }
};
