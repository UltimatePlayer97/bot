import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const data = {
  name: "unlock",
  description:
    "Unlocks the specified channel, allowing users to send messages and react.",
};

export const execute = async (message: Message, args: string[] = []) => {
  if (args[0]?.toLowerCase() === "help") {
    const helpEmbed = new EmbedBuilder()
      .setTitle("🔓 Unlock Command Help")
      .setDescription(
        "Unlocks a specified channel, allowing users to send messages and react."
      )
      .addFields(
        {
          name: "Usage",
          value: "`unlock <#channel>` - Unlocks the mentioned channel.",
        },
        { name: "Example", value: "`unlock #general`" },
        { name: "Permissions", value: "Requires `Manage Channels` permission." }
      )
      .setColor(0x00ff00);

    await message.reply({ embeds: [helpEmbed] });
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ You don't have permission to manage channels.")
          .setColor("#FF0000"),
      ],
    });
    return;
  }

  const channel = message.mentions.channels.first() as TextChannel;

  const everyone_role = message.guild!.roles.everyone;
  const overwrite = channel.permissionOverwrites.cache.get(everyone_role.id);

  if (!overwrite || !overwrite.deny.has(PermissionFlagsBits.SendMessages)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ This channel is already unlocked.")
          .setColor("#FF0000"),
      ],
    });
    return;
  }

  if (!channel) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Please specify a channel to unlock.")
          .setColor("#FF0000"),
      ],
    });
    return;
  }

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: true,
      AddReactions: true,
    });

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`🔓 **${channel}** has been unlocked.`)
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to unlock the channel.")
          .setColor("#FF0000"),
      ],
    });
  }
};
