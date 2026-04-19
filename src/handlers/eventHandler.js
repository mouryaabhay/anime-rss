import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { getFilePaths, getFolderPaths } from '../utils/getPaths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads and registers all event listeners from the "events" folder.
 *
 * @param {import('discord.js').Client} client - The Discord client instance.
 */
export default (client) => {
  const eventFolders = getFolderPaths(path.resolve(__dirname, '..', 'events'));

  console.log('Registering event listeners...');

  for (const eventFolder of eventFolders) {
    const eventFiles = getFilePaths(eventFolder);
    eventFiles.sort();

    // Extract event name from folder path
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    // Set up event listener
    client.on(eventName, async (...args) => {
      for (const eventFile of eventFiles) {
        try {
          const eventFileURL = pathToFileURL(eventFile).href;
          const eventModule = await import(eventFileURL);

          if (eventModule.default) {
            await eventModule.default(client, ...args);
          } else {
            console.warn(`No default export in event file ${eventFile}`);
          }
        } catch (err) {
          console.error(`Error executing event function from file ${eventFile} for event ${eventName}`, err.message);
        }
      }
    });

    console.log(`Registered listener for event: ${eventName}`);
  }
  console.log('All event listener registered successfully.');
};