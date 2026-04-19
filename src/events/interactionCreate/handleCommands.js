import config from "../../configs/config.js";
const { DEVELOPER_IDS, DEV_GUILD_IDS } = config;
import getLocalCommands from "../../utils/commandUtils/functions/getLocalCommands.js";
import CommandErrorLogging from "../../utils/commandUtils/logging/commandErrorLogging.js";
import CommandUsageLogging from "../../utils/commandUtils/logging/commandUsageLogging.js";

export default async (client, interaction) => {
  // Skip if not a chat input command
  if (!interaction.isChatInputCommand()) return;

  // Initialize logging services
  const errorLogger = new CommandErrorLogging(client);
  const commandLogger = new CommandUsageLogging(client);

  // Fetch local commands
  const commandsArray = Array.isArray(await getLocalCommands())
    ? await getLocalCommands()
    : Object.values(await getLocalCommands() || []);

  // Convert to Map for fast lookup
  const localCommands = new Map(commandsArray.map((cmd) => [cmd.name, cmd]));

  // Find the command
  const commandObject = localCommands.get(interaction.commandName);

  try {
    // ✅ Command existence check
    if (!commandObject) {
      return await interaction.reply({
        content: "Command not found.",
        ephemeral: true,
      });
    }

    // 👨‍💻 Developer-only check
    if (commandObject.devOnly && !DEVELOPER_IDS.includes(interaction.user.id)) {
      return await interaction.reply({
        content: "This command is restricted to developers only.",
        ephemeral: true,
      });
    }

    // 🧪 Dev guild-only check
    if (commandObject.devGuildsOnly && !DEV_GUILD_IDS.includes(interaction.guild.id)) {
      return await interaction.reply({
        content: "This command cannot be ran here.",
        ephemeral: true,
      });
    }

    // 🧾 User permissions check
    const userPermissionError = checkPermissions(
      interaction.member.permissions,
      commandObject.permissionsRequired,
      "user"
    );
    if (userPermissionError) {
      return await interaction.reply({ content: userPermissionError, ephemeral: true });
    }

    // 🤖 Bot permissions check
    const bot = interaction.guild.members.me;
    const botPermissionError = checkPermissions(
      bot.permissions,
      commandObject.botPermissions,
      "bot"
    );
    if (botPermissionError) {
      return await interaction.reply({ content: botPermissionError, ephemeral: true });
    }

    // 🚀 Execute command
    await commandObject.execute(client, interaction);

    // 📊 Log command usage
    await commandLogger.logCommandUsage(interaction, interaction.commandName);
  } catch (error) {
    console.error("[ERROR] Command execution error:\n", error);
    await errorLogger.logCommandError(interaction, error);
    try {
      await interaction.reply({
        content: "An error occurred while executing the command.",
        ephemeral: true,
      });
    } catch {
      await interaction.followUp({
        content: "An error occurred while executing the command.",
        ephemeral: true,
      });
    }
  }
};

// ✅ Helper function to check permissions
function checkPermissions(permissions, requiredPermissions, type) {
  if (!requiredPermissions) return null; // No permissions required

  for (const permission of requiredPermissions) {
    if (!permissions.has(permission)) {
      return type === "user"
        ? "You do not have the required permission to use this command."
        : "I do not have the required permission to execute this command.";
    }
  }

  return null; // All permissions granted
}
