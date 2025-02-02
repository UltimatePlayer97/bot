import {
  Message,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder,
} from "discord.js";

export const data = {
  name: "unmute",
  description: "Unmute a user in the server.",
};

export const execute = async (
  message: Message,
  args: string[]
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    const help_embed = new EmbedBuilder()
      .setTitle("Unmute Command Usage")
      .setDescription(
        "`unmute @user <duration> [reason]` -  Unmutes the mentioned user with an optional reason.\n" +
          "`unmute help` - Shows this help message."
      )
      .setColor("#5865f2");

    await message.reply({ embeds: [help_embed] });
    return;
  }

  if (!message || !message.member || !message.guild) {
    console.error("❌ Invalid message object received:", message);
    return;
  }

  if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await message.reply("❌ You don't have permission to unmute members.");
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(
      PermissionFlagsBits.ModerateMembers
    )
  ) {
    await message.reply("❌ I don't have permission to unmute members.");
    return;
  }

  let target: GuildMember | undefined;

  if (message.mentions.members?.first()) {
    target = message.mentions.members.first()!;
  } else {
    const userId = args[0];
    if (userId) {
      try {
        target = await message.guild.members.fetch(userId);
      } catch {
        await message.reply("❌ User ID not found.");
        return;
      }
    }
  }

  if (!target) {
    await message.reply("❌ Please mention a user or provide their ID.");
    return;
  }

  if (!target.communicationDisabledUntilTimestamp) {
    await message.reply("❌ This user is not muted.");
    return;
  }

  try {
    await target
      .send(`🔊 You have been **unmuted** in **${message.guild.name}**.`)
      .catch(() => console.log(`❌ Failed to DM ${target.user.tag}.`));

    await message.reply(`✅ ${target.user.tag} has been unmuted.`);

    await target.timeout(null);
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to unmute the user.");
  }
};
