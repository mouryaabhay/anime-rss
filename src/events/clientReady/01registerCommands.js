import config from "../../configs/config.js";
const { GUILD_IDS } = config;
import getLocalCommands from "../../utils/commandUtils/functions/getLocalCommands.js";
import getApplicationCommands from "../../utils/commandUtils/functions/getApplicationCommands.js";
import areCommandsDifferent from "../../utils/commandUtils/functions/areCommandsDifferent.js";

/**
 * Registers, updates, or removes Discord commands for each guild in GUILD_IDS.
 */
export default async function registerCommands(client) {
  try {
    const localCommands = await getLocalCommands();

    // Loop through each guild ID in GUILD_IDS
    for (const guildId of GUILD_IDS) {
      const applicationCommands = await getApplicationCommands(client, guildId);
      const guild = client.guilds.cache.get(guildId);
      const guildName = guild ? guild.name : "Unknown Guild";

      await processCommands(localCommands, applicationCommands, guildName);
    }

    // Handle deregistration for servers that are no longer in GUILD_IDS
    await deregisterRemovedGuilds(client);
  } catch (error) {
    console.error(
      "[ERROR]  An error occurred while processing commands:\n",
      error
    );
  }
}

/**
 * Synchronizes local commands with registered Discord application commands.
 */
async function processCommands(localCommands, applicationCommands, guildName) {
  for (const localCommand of localCommands) {
    const { name, description, options, deleted } = localCommand;
    const existingCommand = applicationCommands.cache.find(
      (cmd) => cmd.name === name
    );

    if (deleted) {
      await handleCommandDeletion(existingCommand, name, guildName);
      continue;
    }

    if (existingCommand) {
      await handleCommandEdit(existingCommand, localCommand, guildName);
      continue;
    }

    await handleCommandCreation(applicationCommands, localCommand, guildName);
  }

  // Delete commands that are not in the local commands
  await deleteUnlistedCommands(localCommands, applicationCommands, guildName);
}

async function handleCommandDeletion(existingCommand, name, guildName) {
  if (existingCommand) {
    await existingCommand.delete();
    console.info(`[INFO]   🗑️  Deleted command "${name}" from "${guildName}".`);
  }
}

async function handleCommandEdit(existingCommand, localCommand, guildName) {
  if (areCommandsDifferent(existingCommand, localCommand)) {
    await existingCommand.edit({
      description: localCommand.description,
      options: localCommand.options,
    });
    console.info(
      `[INFO]   🔁 Edited command "${localCommand.name}" in "${guildName}" (Command ID: ${existingCommand.id}).`
    );
  }
}

async function handleCommandCreation(
  applicationCommands,
  localCommand,
  guildName
) {
  const newCommand = await applicationCommands.create({
    name: localCommand.name,
    description: localCommand.description,
    options: localCommand.options,
  });
  console.info(
    `[INFO]   ✅ Registered command "${localCommand.name}" in "${guildName}".`
  );
}

async function deleteUnlistedCommands(
  localCommands,
  applicationCommands,
  guildName
) {
  for (const existingCommand of applicationCommands.cache.values()) {
    if (
      !localCommands.some(
        (localCommand) => localCommand.name === existingCommand.name
      )
    ) {
      await existingCommand.delete();
      console.warn(
        `[WARN]   🗑️  Deleted command "${existingCommand.name}" from "${guildName}" as it is not listed in the local commands.`
      );
    }
  }
}

async function deregisterRemovedGuilds(client) {
  const allGuildsId = client.guilds.cache.map((guild) => guild.id);
  const removedGuildsId = allGuildsId.filter(
    (guildId) => !GUILD_IDS.includes(guildId)
  );

  for (const removedGuildId of removedGuildsId) {
    const applicationCommands = await getApplicationCommands(
      client,
      removedGuildId
    );
    const guildName =
      client.guilds.cache.get(removedGuildId)?.name || "Unknown Guild";

    for (const existingCommand of applicationCommands.cache.values()) {
      await existingCommand.delete();
      console.warn(
        `[WARN]   🗑️  Deleted command "${existingCommand.name}" from "${guildName}" as the guild is no longer in GUILD_IDS.`
      );
    }
  }
}
