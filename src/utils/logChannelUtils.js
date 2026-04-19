import config from '../configs/config.js';

let errorLoggingChannel = null;
let interactionLoggingChannel = null;

// Function to initialize and set the log channel (called once when the bot starts)
export function setInteractionLogChannel(client) {
  interactionLoggingChannel = client.channels.cache.get(config.LOGGING_CHANNEL.INTERACTION_LOG);
  if (!interactionLoggingChannel) {
    console.error('[ERROR]  Interaction log channel not set in configuration!');
  } else {
    console.info(`[INFO]   Interaction log channel is configured: ${interactionLoggingChannel.name}`);
  }
}

export function setErrorLogChannel(client) {
  errorLoggingChannel = client.channels.cache.get(config.LOGGING_CHANNEL.ERROR_LOG);
  if (!errorLoggingChannel) {
    console.error('[ERROR]  Error log channel not set in configuration!');
  } else {
    console.info(`[INFO]   Error log channel is configured: ${errorLoggingChannel.name}`);
  }
}

// Function to get the log channel (accessible globally)
export function getInteractionLogChannel() {
  return interactionLoggingChannel;
}

export function getErrorLogChannel() {
  return errorLoggingChannel;
}
