import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const data = {
  name: "slowmode",
  description: "Changes the slowmode timer of the channel.",
};

export const execute = async (
  message: Message,
  args: string[] = []
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("Slowmode Command Usage")
          .setDescription(
            "`slowmode [time]` - Sets the slowmode of the current channel.\n" +
              "`slowmode help` - Shows this help message.\n\n" +
              "**Time Formats:**\n" +
              "- `5s` → 5 seconds\n" +
              "- `2m` → 2 minutes (120s)\n" +
              "- `1h` → 1 hour (3600s)\n" +
              "- `2.5m` → 2 minutes 30 seconds (150s)\n" +
              "- `6h` → 6 hours (21600s, max limit)"
          )
          .setColor(0x5865f2),
      ],
    });
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ You don't have permission to set slowmode.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  if (
    !message.guild?.members.me?.permissions.has(
      PermissionFlagsBits.ManageMessages
    )
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ I don't have permission to set slowmode.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  if (!args[0]) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ Please specify a valid time (e.g., `5s`, `2.5m`, `1h`)."
          )
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const timeMatch = args[0].match(/^(\d*\.?\d+)([smh])$/);
  if (!timeMatch) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Invalid format. Use `5s`, `2.5m`, or `1h`.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const [, value, unit] = timeMatch;
  let slowmodeSeconds = parseFloat(value);

  if (unit === "m") slowmodeSeconds *= 60;
  else if (unit === "h") slowmodeSeconds *= 3600;

  if (slowmodeSeconds > 21600) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Maximum slowmode is 6 hours (21600 seconds).")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    await channel.setRateLimitPerUser(Math.floor(slowmodeSeconds));
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `✅ Slowmode set to **${Math.floor(slowmodeSeconds)} seconds**.`
          )
          .setColor(0x5865f2),
      ],
    });
  } catch {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to set slowmode.")
          .setColor(0xff0000),
      ],
    });
  }
};
