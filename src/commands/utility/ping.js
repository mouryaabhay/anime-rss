export default {
  name: "ping",
  description: "Get host's latency and bot uptime",
  // devOnly: true,
  // devGuildsOnly: true,
  // deleted: true,

  execute: async (client, interaction) => {
    await interaction.deferReply();

    // Calculate ping
    const reply = await interaction.fetchReply();
    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    // Calculate uptime
    const uptime = process.uptime(); // uptime in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Format uptime
    const uptimeString = `${hours}h ${minutes}m ${seconds}s`;

    await interaction.editReply(
      `> **Pong <:fpingpong:1205502456222580777>**\n- **Uptime:** ${uptimeString}\n- **Latency:**\n  - **Client:** ${ping}ms\n  - **Websocket:** ${client.ws.ping}ms`
    );
  },
};
