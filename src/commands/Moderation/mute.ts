import {
  Message,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder,
} from "discord.js";

export const data = {
  name: "mute",
  description: "Mute a user for a specified duration (e.g., 10s, 5m, 2h, 1d).",
};

const parseDuration = (input: string): number | null => {
  const match = input?.match(/^(\d+)([smhd])$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
};

export const execute = async (
  message: Message,
  args: string[]
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    const help_embed = new EmbedBuilder()
      .setTitle("Mute Command Usage")
      .setDescription(
        "`mute @user <duration> [reason]` -  Mutes the mentioned user for the specified duration.\n" +
          "`mute help` - Shows this help message."
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
    await message.reply("❌ You don't have permission to mute members.");
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(
      PermissionFlagsBits.ModerateMembers
    )
  ) {
    await message.reply("❌ I don't have permission to mute members.");
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

  if (!target.moderatable) {
    await message.reply(
      "❌ I can't mute this user. They may have a higher role than me."
    );
    return;
  }

  const durationArg = args[1];

  if (!durationArg) {
    await message.reply(
      "❌ You must specify a duration (e.g., `10s`, `5m`, `2h`, `1d`)."
    );
    return;
  }

  const durationMs = parseDuration(durationArg);
  if (!durationMs) {
    await message.reply(
      "❌ Invalid duration format. E.g. `10s`, `5m`, `2h`, or `1d`."
    );
    return;
  }

  const reason = args.slice(2).join(" ") || "No reason provided";

  try {
    await target
      .send(
        `🚫 You were muted in ${message.guild.name} for ${durationArg}. | Reason: ${reason}`
      )
      .catch(() =>
        console.log(
          `❌ Failed to DM ${target.user.tag}. They may have DMs disabled.`
        )
      );

    await target.timeout(durationMs, reason);
    await message.reply(
      `✅ Muted ${target.user.tag} for ${durationArg}. | Reason: **${reason}**`
    );
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to mute the user.");
  }
};
