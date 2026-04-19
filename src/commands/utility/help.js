import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";
import config from "../../configs/config.js";
const { EMBED_COLORS } = config;
import getLocalCommands from "../../utils/commandUtils/functions/getLocalCommands.js";
import getApplicationCommands from "../../utils/commandUtils/functions/getApplicationCommands.js";
import { sendSysErrorMessage } from "../../utils/sysErrorEmbed.js";

export default {
  name: "help",
  description: "Get information about all the available commands",

  execute: async (client, interaction) => {
    try {
      // Fetch commands
      const commandsArrayRaw = await getLocalCommands();
      const commandsArray = Array.isArray(commandsArrayRaw)
        ? commandsArrayRaw
        : Object.values(commandsArrayRaw || []);

      const activeCommands = commandsArray
        .filter(cmd => !cmd.deleted)
        .sort((a, b) => a.name.localeCompare(b.name));

      // Get guild application commands
      const applicationCommands = await getApplicationCommands(client, interaction.guildId);
      const commandNameMap = new Map(applicationCommands.cache.map(appCmd => [appCmd.name, appCmd.id]));

      // Build command descriptions
      const commandDescriptions = activeCommands.map(cmd => {
        const cmdId = commandNameMap.get(cmd.name) || "0";
        return `> **</${cmd.name}:${cmdId}>**\n- ${cmd.description || "No description available"}`;
      });

      const descriptionText = `**Message from [@mouryaabhay](https://github.com/mouryaabhay/):**\nThis bot was created to fetch RSS feeds from Anime News Network and directly send a formated messge into your Discord server.\nThe source code is open-sourced under the MIT License. Please note that it was developed early in my programming journey, so the code may not follow best practices.\n\nThis bot is intended for private, non-commercial use. Contributions to improve the code are always welcome!\n\n**Commands:**\n${commandDescriptions.join("\n")}`.slice(0, 4096);

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.PRIMARY)
        .setAuthor({
          name: `${client.user.username} Command List`,
          iconURL: client.user.displayAvatarURL(),
        })
        .setDescription(descriptionText);

      // Create buttons
      const githubButton = new ButtonBuilder()
        .setLabel("GitHub Repo")
        .setStyle(ButtonStyle.Link)
        .setURL("https://github.com/mouryaabhay/rss-yuki");

      const discordButton = new ButtonBuilder()
        .setLabel("Join Discord")
        .setStyle(ButtonStyle.Link)
        .setURL("https://discord.com/invite/E4KRWJW49B");

      const actionRow = new ActionRowBuilder().addComponents(githubButton, discordButton);

      const replyData = { embeds: [embed], components: [actionRow]};

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyData);
      } else {
        await interaction.reply(replyData);
      }

    } catch (error) {
      console.error("[ERROR] Error in help command:\n", error);
      if (typeof sendSysErrorMessage === "function") {
        sendSysErrorMessage(import.meta.url, `Error retrieving command list:\n${error.message}`);
      }

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: "There was an error retrieving the command list.", ephemeral: true });
        } else {
          await interaction.reply({ content: "There was an error retrieving the command list.", ephemeral: true });
        }
      } catch { }
    }
  },
};
