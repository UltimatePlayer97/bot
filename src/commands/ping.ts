import { Message, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export const data = {
  name: "ping",
  description: "Test replies.",
};

export const execute = async (
  message: Message,
  args: string[],
): Promise<void> => {
  await message.reply("pong!");
};
