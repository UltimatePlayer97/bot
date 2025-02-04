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
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🚫 Mute Command Help")
          .setDescription("Mutes a specified user for a given duration.")
          .addFields(
            {
              name: "Usage",
              value:
                "`mute @user <duration> [reason]` - Mutes the mentioned user.",
            },
            { name: "Example", value: "`mute @UltimatePlayer 5m Spamming`" },
            {
              name: "Permissions",
              value: "Requires `Moderate Members` permission.",
            }
          )
          .setColor(0x5865f2),
      ],
    });
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ You don't have permission to mute members.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  if (
    !message.guild?.members.me?.permissions.has(
      PermissionFlagsBits.ModerateMembers
    )
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ I don't have permission to mute members.")
          .setColor(0xff0000),
      ],
    });
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
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ User ID not found.")
              .setColor(0xff0000),
          ],
        });
        return;
      }
    }
  }

  if (!target) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Please mention a user or provide their ID.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  if (!target.moderatable) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ I can't mute this user. They may have a higher role than me."
          )
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const durationArg = args[1];

  if (!durationArg) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ You must specify a duration (e.g., `10s`, `5m`, `2h`, `1d`)."
          )
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const durationMs = parseDuration(durationArg);
  if (!durationMs) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ Invalid duration format. E.g. `10s`, `5m`, `2h`, or `1d`."
          )
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const reason = args.slice(2).join(" ") || "No reason provided";

  try {
    await target
      .send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `🚫 You were muted in **${message.guild.name}** for **${durationArg}**.\n**Reason:** ${reason}`
            )
            .setColor(0xffa500),
        ],
      })
      .catch(() => console.log(`❌ Failed to DM ${target.user.tag}.`));

    await target.timeout(durationMs, reason);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `✅ **${target.user.tag}** has been muted for **${durationArg}**.\n**Reason:** ${reason}`
          )
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to mute the user.")
          .setColor(0xff0000),
      ],
    });
  }
};
