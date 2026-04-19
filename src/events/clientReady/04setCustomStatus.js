import { PresenceUpdateStatus, ActivityType } from "discord.js";

export default (client) => {
  client.user.setPresence({
    status: PresenceUpdateStatus.Online,
    activities: [
      {
        name: "Open-source magic ✨",
        type: ActivityType.Streaming,
        url: "https://github.com/mouryaabhay/yuki",
      },
    ],
  });

  console.log("[INFO]   Presence with clickable GitHub link set successfully.");
};
