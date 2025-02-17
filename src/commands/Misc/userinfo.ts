import { Message, EmbedBuilder, TextChannel } from "discord.js";

export const data = {
  name: "userinfo",
  description: "Provides information about a user.",
};

export const execute = async (
  message: Message,
  args: string[]
): Promise<void> => {
  let target = message.mentions.members?.first();

  const channel = message.channel as TextChannel;

  if (!target && args[0]) {
    try {
      target = await message.guild?.members.fetch(args[0]);
    } catch (error) {
      console.error("User not found by ID:", error);
    }
  }

  if (!target) {
    target = message.member ?? undefined;
  }

  if (!target) {
    await channel.send("❌ Could not find the specified user.");
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle("User Information")
    .setThumbnail(target.user.displayAvatarURL())
    .addFields(
      { name: "Username", value: target.user.tag, inline: true },
      { name: "User ID", value: target.id, inline: true },
      {
        name: "Joined Server",
        value: target.joinedAt ? target.joinedAt.toDateString() : "Unknown",
        inline: true,
      },
      {
        name: "Account Created",
        value: target.user.createdAt.toDateString(),
        inline: true,
      }
    )
    .setColor("Random")
    .setTimestamp()
    .setFooter({ text: `Requested by ${message.author.username}` });

  await channel.send({ embeds: [embed] });
};
