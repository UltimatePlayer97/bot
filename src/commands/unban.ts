import { Message, PermissionFlagsBits, Client } from "discord.js";

export const data = {
  name: "unban",
  description: "unban a user from the server.",
};

export const execute = async (
  message?: Message,
  args: string[] = []
): Promise<void> => {
  if (!message || !message.member || !message.guild) {
    console.error("❌ Invalid message object received:", message);
    return;
  }

  console.log(
    "✅ unban command executed by:",
    message.author.tag,
    "Args:",
    args
  );

  if (args[0]?.toLowerCase() === "help") {
    await message.reply(
      "**Unban Command Usage:**\n" +
        "`unban <userID> [reason]` - Unbans the user with the given ID and an optional reason.\n" +
        "`unban help` - Shows this help message."
    );
    return;
  }

  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message.reply("❌ You don't have permission to unban members.");
    return;
  }

  const user_id = args[0];
  if (!user_id) {
    await message.reply("❌ Please mention a user to unban.");
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)
  ) {
    await message.reply("❌ I don't have permission to unban members.");
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    const bans = await message.guild.bans.fetch();
    const banned_user = bans.get(user_id);

    if (!banned_user) {
      await message.reply("❌ This user is not banned.");
      return;
    }

    await message.guild.members.unban(user_id, reason);
    await message.reply(
      `✅ Successfully unbanned **${banned_user.user.tag} ** with reason **${reason}**.`
    );
  } catch (error) {
    console.error(error);
    await message.reply(
      "❌ Failed to unban the user. Make sure the ID is correct."
    );
  }
};
