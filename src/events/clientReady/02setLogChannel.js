import {
  setInteractionLogChannel,
  setErrorLogChannel,
  getInteractionLogChannel,
  getErrorLogChannel,
} from "../../utils/logChannelUtils.js";

export default (client) => {
  // Initialize log channels
  setInteractionLogChannel(client);
  setErrorLogChannel(client);

  if (!getInteractionLogChannel()) {
    console.warn("[WARN]   Interaction log channel details not received!");
  } else {
    console.log(
      "[INFO]   Interaction log channel details received and ready."
    );
  }

  if (!getErrorLogChannel()) {
    console.warn("[WARN]   Error log channel details not received!");
  } else {
    console.log("[INFO]   Error log channel details received and ready.");
  }
};
