import { Message, PermissionFlagsBits, Client, EmbedBuilder } from "discord.js";

export const data = {
  name: "ban",
  description: "Ban a user from the server.",
};

export const execute = async (
  message: Message,
  args: string[] = []
): Promise<void> => {
  if (!message || !message.member || !message.guild) {
    console.error("❌ Invalid message object received:", message);
    return;
  }

  console.log("✅ Ban command executed by:", message.author.tag, "Args:", args);

  if (args[0]?.toLowerCase() === "help") {
    const help_embed = new EmbedBuilder()
      .setTitle("Ban Command Usage")
      .setDescription(
        "`ban user [reason]` - Bans the mentioned user with an optional reason.\n" +
          "`ban help` - Shows this help message."
      )
      .setColor("#5865f2");

    await message.reply({ embeds: [help_embed] });
    return;
  }

  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ You don't have permission to ban members.")
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    });
    return;
  }

  let target;
  if (message.mentions.members?.first()) {
    target = message.mentions.members.first();
  } else {
    const user_id = args[0];
    if (user_id) {
      try {
        target = await message.guild.members.fetch(user_id);
      } catch (error) {
        await message.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("❌ User ID not found.")
              .setColor("#FF0000")
              .setTimestamp(),
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
          .setDescription("❌ Please mention a user to ban.")
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    });
    return;
  }

  if (
    !message.guild.members.me?.permissions.has(PermissionFlagsBits.BanMembers)
  ) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription("❌ I don't have permission to ban members.")
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    });
    return;
  }

  if (!target.bannable) {
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            "❌ I can't ban this user. They may have a higher role than me."
          )
          .setColor("#FF0000")
          .setTimestamp(),
      ],
    });
    return;
  }

  const reason = args.slice(1).join(" ") || "No reason provided";

  try {
    await target
      .send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Banned from ${message.guild.name}`)
            .setDescription(
              `🚫 You were banned in ${message.guild.name}. | Reason: ${reason}`
            )
            .setTimestamp(),
        ],
      })
      .catch(() =>
        console.log(
          `❌ Failed to DM ${target.user.tag}. They may have DMs disabled.`
        )
      );

    await target.ban({ reason });
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(
            `✅ ${target.user.tag} has been banned. | Reason: ${reason}`
          )
          .setColor("#5865f2")
          .setTimestamp(),
      ],
    });
  } catch (error) {
    console.error(error);
    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(`❌ Failed to ban ${target.user.tag}.`)
          .setColor("#5865f2")
          .setTimestamp(),
      ],
    });
  }
};
