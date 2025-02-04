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
          .setTitle("Kick Command Usage")
          .setDescription(
            "`slowmode [time] - sets slowmode of specified channel.`\n" +
              "`slowmode help` - Shows this help message."
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

  let num = parseInt(args[0]);

  if (isNaN(num)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Please provide a valid number.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    await channel.setRateLimitPerUser(num);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ Slowmode set to ${num} seconds.`)
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
