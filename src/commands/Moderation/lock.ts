import {
  EmbedBuilder,
  Message,
  PermissionFlagsBits,
  TextChannel,
} from "discord.js";

export const data = {
  name: "lock",
  description:
    "Locks the specified channel, preventing users from sending messages and reacting.",
};

export const execute = async (message: Message, args: string[] = []) => {
  if (args[0]?.toLowerCase() === "help") {
    const helpEmbed = new EmbedBuilder()
      .setTitle("🔒 Lock Command Help")
      .setDescription(
        "Locks a specified channel, preventing users from sending messages and adding reactions."
      )
      .addFields(
        {
          name: "Usage",
          value: "`lock <#channel>` - Locks the mentioned channel.",
        },
        { name: "Example", value: "`lock #general`" },
        { name: "Permissions", value: "Requires `Manage Channels` permission." }
      )
      .setColor(0xff0000);

    await message.reply({ embeds: [helpEmbed] });
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("❌ You don't have permission to manage channels.");
    return;
  }

  const channel = message.mentions.channels.first() as TextChannel;

  const everyone_role = message.guild!.roles.everyone;
  const overwrite = channel.permissionOverwrites.cache.get(everyone_role.id);

  if (!overwrite || overwrite.deny.has(PermissionFlagsBits.SendMessages)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ This channel is already locked.")
          .setColor("#FF0000"),
      ],
    });
    return;
  }

  if (!channel) {
    await message.reply(
      "❌ Please specify a channel to lock. Example: `lock #general`"
    );
    return;
  }

  try {
    await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
      SendMessages: false,
      AddReactions: false,
    });

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`🔓 **${channel}** has been locked.`)
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to lock the channel.");
  }
};
