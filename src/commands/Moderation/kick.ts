import {
  Message,
  PermissionFlagsBits,
  Client,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

export const data = {
  name: "kick",
  description: "Kick a user from the server.",
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
            "`kick @user [reason]` - Kicks the mentioned user with an optional reason.\n" +
              "`kick help` - Shows this help message."
          )
          .setColor(0x5865f2),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (!message.member?.permissions.has(PermissionFlagsBits.KickMembers)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ You don't have permission to kick members.")
          .setColor(0xff0000),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (
    !message.guild?.members.me?.permissions.has(PermissionFlagsBits.KickMembers)
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ I don't have permission to kick members.")
          .setColor(0xff0000),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
    return;
  }

  let target: GuildMember | undefined;

  if (message.mentions.members?.first()) {
    target = message.mentions.members.first()!;
  } else {
    const user_id = args[0];
    if (user_id) {
      try {
        target = await message.guild.members.fetch(user_id);
      } catch {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ User ID not found.")
              .setColor(0xff0000),
          ],
        }).then(msg => setTimeout(() => msg.delete(), 5000));
        return;
      }
    }
  }

  if (!target) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Please mention a user to kick.")
          .setColor(0xff0000),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
    return;
  }

  if (!target.kickable) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ I can't kick this user. They may have a higher role than me."
          )
          .setColor(0xff0000),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    await target
      .send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `🚫 You were kicked from **${message.guild.name}**.\n**Reason:** ${reason}`
            )
            .setColor(0xffa500),
        ],
      })
      .catch(() =>
        console.log(
          `❌ Failed to DM ${target.user.tag}. They may have DMs disabled.`
        )
      );

    await target.kick(reason);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `✅ **${target.user.tag}** has been kicked.\n**Reason:** ${reason}`
          )
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to kick the user.")
          .setColor(0xff0000),
      ],
    }).then(msg => setTimeout(() => msg.delete(), 5000));
  }
};
