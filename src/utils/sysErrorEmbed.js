import { EmbedBuilder } from "discord.js";
import config from "../configs/config.js";
import { getErrorLogChannel } from "./logChannelUtils.js";

const { EMBED_COLORS } = config;

export async function sendSysErrorMessage(filePath, customMessage) {
  const channel = getErrorLogChannel();

  try {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setTitle("Error Report")
      .addFields(
        { name: "> Error from file:", value: `\`\`\`${filePath}\`\`\`` },
        { name: "> Error Details:", value: customMessage }
      )
      .setTimestamp();

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("[ERROR] Error sending error message:\n", error);
  }
}
