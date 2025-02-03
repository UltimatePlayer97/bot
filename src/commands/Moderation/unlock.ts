import { Message, PermissionFlagsBits, TextChannel } from "discord.js";

export const data = {
  name: "unlock",
  description:
    "Unlocks the current channel, allowing users to send messages again.",
};

export const execute = async (message: Message) => {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("❌ You don't have permission to unlock channels.");
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    await channel.permissionOverwrites.edit(message.guild!.roles.everyone, {
      SendMessages: true,
      AddReactions: true
    });

    await message.reply(`🔓 **${channel.name}** has been unlocked.`);
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to unlock the channel.");
  }
};
