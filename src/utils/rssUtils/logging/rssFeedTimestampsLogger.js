import path from "path";
import { promises as fsPromises } from "fs";
import { sendSysErrorMessage } from "../../sysErrorEmbed.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the path to the JSON file that stores RSS feed timestamps
const RSS_FEED_TIMESTAMPS_FILE_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "data",
  "rssFeedTimestamps.json"
);

// Function to load timestamps from the JSON file
export async function loadTimestamps() {
  try {
    const rawData = await fsPromises.readFile(RSS_FEED_TIMESTAMPS_FILE_PATH, "utf-8");
    return new Map(Object.entries(JSON.parse(rawData))); // Convert parsed JSON to a Map
  } catch (error) {
    console.error(
      `[ERROR]  Error loading feed timestamps from file: ${RSS_FEED_TIMESTAMPS_FILE_PATH}\n`,
      error
    );
    sendSysErrorMessage(
      __filename,
      `- Error loading feed timestamps from file: ${RSS_FEED_TIMESTAMPS_FILE_PATH}`
    );
    return new Map(); // Return empty map if read fails
  }
}

// Function to save timestamps to the JSON file
export async function saveTimestamps(timestamps) {
  try {
    await fsPromises.writeFile(
      RSS_FEED_TIMESTAMPS_FILE_PATH,
      JSON.stringify(Object.fromEntries(timestamps), null, 4) // Pretty-print JSON
    );
    console.info(
      `[INFO]   Updated feed timestamps written to file: "${RSS_FEED_TIMESTAMPS_FILE_PATH}"`
    );
  } catch (error) {
    console.error(
      `[ERROR]  Error updating feed timestamps to file: ${RSS_FEED_TIMESTAMPS_FILE_PATH}`,
      error
    );
    sendSysErrorMessage(
      __filename,
      `- Error updating feed timestamps to file: ${RSS_FEED_TIMESTAMPS_FILE_PATH}`
    );
  }
}
