export default async function fetchApplicationCommands(client, guildId) {
  try {
    let commands;

    // Fetch commands from a specific guild or globally
    if (guildId) {
      const guild = await client.guilds.fetch(guildId);
      commands = guild.commands;
    } else {
      commands = client.application.commands;
    }

    // Fetch and return the commands
    await commands.fetch();
    return commands;
  } catch (error) {
    console.error("[ERROR]  Error fetching application commands:\n", error);
    throw error; // Rethrow the error after logging it
  }
}
