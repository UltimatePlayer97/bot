import { Message } from "discord.js";

export const data = {
  name: "ping",
  description: "Test replies.",
  category: "sd_TU_DIAG",
};

export const execute = async (message: Message): Promise<void> => {
  await message.reply("pong!");
};
