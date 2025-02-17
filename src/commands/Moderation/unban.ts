import { Message, PermissionFlagsBits, Client, EmbedBuilder } from "discord.js";

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
    const help_embed = new EmbedBuilder()
      .setTitle("Unban Command Usage")
      .setDescription(
        "`unban userID [reason]` - Unbans the user with the given ID and an optional reason.\n" +
          "`unban help` - Shows this help message."
      )
      .setColor("#5865f2");

    await message
      .reply({ embeds: [help_embed] })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ You don't have permission to unban members.")
            .setColor("#FF0000")
            .setTimestamp(),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  const user_id = args[0];
  if (!user_id) {
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ Please mention a user to unban.")
            .setColor("#FF0000")
            .setTimestamp(),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)
  ) {
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("❌ I don't have permission to unban members.")
            .setColor("#FF0000")
            .setTimestamp(),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    const bans = await message.guild.bans.fetch();
    const banned_user = bans.get(user_id);

    if (!banned_user) {
      await message
        .reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ This user is not banned.")
              .setColor("#FF0000")
              .setTimestamp(),
          ],
        })
        .then((msg) => setTimeout(() => msg.delete(), 5000));
      return;
    }

    await message.guild.members.unban(user_id, reason);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `✅ **${banned_user.user.tag} ** has been unbanned. | Reason: **${reason}**.`
          )
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    });
  } catch (error) {
    console.error(error);
    await message
      .reply({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              "❌ Failed to unban the user. Make sure the ID is correct."
            )
            .setColor("#FF0000")
            .setTimestamp(),
        ],
      })
      .then((msg) => setTimeout(() => msg.delete(), 5000));
  }
};
