import {
  Message,
  PermissionFlagsBits,
  GuildMember,
  EmbedBuilder,
} from "discord.js";

export const data = {
  name: "unmute",
  description: "Unmute a user in the server.",
};

export const execute = async (
  message: Message,
  args: string[]
): Promise<void> => {
  if (args[0]?.toLowerCase() === "help") {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🔊 Unmute Command Help")
          .setDescription("Unmutes a specified user in the server.")
          .addFields(
            {
              name: "Usage",
              value: "`unmute @user` - Unmutes the mentioned user.",
            },
            { name: "Example", value: "`unmute @UltimatePlayer`" },
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
          .setDescription("❌ You don't have permission to unmute members.")
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
          .setDescription("❌ I don't have permission to unmute members.")
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

  if (!target.communicationDisabledUntilTimestamp) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ This user is not muted.")
          .setColor(0xff0000),
      ],
    });
    return;
  }

  try {
    await target
      .send({
        embeds: [
          new EmbedBuilder()
            .setDescription(
              `🔊 You have been **unmuted** in **${message.guild.name}**.`
            )
            .setColor(0x00ff00),
        ],
      })
      .catch(() => console.log(`❌ Failed to DM ${target.user.tag}.`));

    await target.timeout(null);

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`✅ **${target.user.tag}** has been unmuted.`)
          .setColor(0x00ff00),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ Failed to unmute the user.")
          .setColor(0xff0000),
      ],
    });
  }
};
