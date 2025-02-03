import { Message, PermissionFlagsBits, TextChannel } from "discord.js";

export const data = {
  name: "lock",
  description:
    "Locks the current channel, preventing users from sending messages.",
};

export const execute = async (message: Message) => {
  if (!message.member?.permissions.has(PermissionFlagsBits.ManageChannels)) {
    await message.reply("❌ You don't have permission to lock channels.");
    return;
  }

  const channel = message.channel as TextChannel;

  try {
    await channel.permissionOverwrites.edit(message.guild!.roles.everyone, {
      SendMessages: false,
      AddReactions: false,
    });

    await message.reply(`🔒 **${channel.name}** has been locked.`);
  } catch (error) {
    console.error(error);
    await message.reply("❌ Failed to lock the channel.");
  }
};
