import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { getFilePaths, getFolderPaths } from '../../getPaths.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads all local command modules from the `/commands` directory recursively.
 * Each command file must default-export a command object.
 *
 * @returns {Promise<Array<Object>>} Resolves to an array of command definitions.
 */
export default async function getLocalCommands() {
  const localCommands = [];

  const commandsDir = path.join(__dirname, '../../../commands');
  const commandCategories = getFolderPaths(commandsDir);

  for (const commandCategory of commandCategories) {
    // Get all command files in the current category (folder)
    const commandFiles = getFilePaths(commandCategory);

    // Iterate over each command file
    for (const commandFile of commandFiles) {
      try {
        // Convert the path to a file:// URL before import
        const fileURL = pathToFileURL(commandFile).href;
        const commandModule = await import(fileURL);

        if (commandModule?.default) {
          localCommands.push(commandModule.default);
          console.debug(`Loaded command from file: ${commandFile}`);
        } else {
          console.warn(`No default export found in: ${commandFile}`);
        }
      } catch (err) {
        console.error(`Error loading command from file: ${commandFile}`, err.message);
      }
    }
  }

  return localCommands;
}