import { Message } from "discord.js";

export const data = {
  name: "ping",
  description: "Test replies.",
};

export const execute = async (message: Message): Promise<void> => {
  await message.reply("pong!");
};
