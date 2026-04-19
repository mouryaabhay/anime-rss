import { EmbedBuilder } from "discord.js";
import config from "../../../configs/config.js";
import { getInteractionLogChannel } from "../../logChannelUtils.js";

const { EMBED_COLORS } = config;
const LOG_CHANNEL = getInteractionLogChannel();

export default class CommandLoggingService {
  async logCommandUsage(interaction) {
    if (!LOG_CHANNEL) {
      console.warn("[WARN]   Command log channel not configured.");
      return;
    }

    try {
      const commandOptions = this.extractCommandOptions(interaction);

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.INFORMATION)
        .setTitle("Command Usage Log")
        .addFields([
          {
            name: "> User",
            value: `- @${interaction.user.tag}\n- \`${interaction.user.id}\``,
            inline: true,
          },
          {
            name: "> Server",
            value: `- ${interaction.guild.name}\n- \`${interaction.guild.id}\``,
            inline: true,
          },
          {
            name: "> Command",
            value: `- ${interaction.commandName}`,
            inline: false,
          },
        ])
        .setTimestamp();

      // Add command options
      if (commandOptions.length > 0) {
        embed.addFields({
          name: "> Command Options",
          value:
            commandOptions
              .map((opt) => `- ${opt.name}: \`${opt.value}\``)
              .join("\n") || "No options",
          inline: false,
        });
      }

      await LOG_CHANNEL.send({ embeds: [embed] });
    } catch (error) {
      console.error(
        `[ERROR]  Error logging command usage in channel #${LOG_CHANNEL?.name}:\n`,
        error
      );
    }
  }

  extractCommandOptions(interaction) {
    return interaction.options.data.map((option) => ({
      name: option.name,
      value: option.value,
      type: option.type,
    }));
  }
}
