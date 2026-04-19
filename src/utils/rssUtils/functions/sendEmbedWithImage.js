import axios from "axios";
import fs from "fs/promises";
import path from "path";

/**
 * Sends an embed with an optional image attachment and optional components.
 * Handles Windows file locks and missing directory automatically.
 */
export async function sendEmbedWithImage(channel, embed, imageUrl = null, components = []) {
  try {
    const sendOptions = { embeds: [embed] };

    // Handle image if provided
    if (imageUrl) {
      const filename = path.basename(imageUrl.split("?")[0]) || `image_${Date.now()}.jpg`;
      const dataDir = path.resolve("./data");
      const filepath = path.join(dataDir, filename);

      // Ensure directory exists
      await fs.mkdir(dataDir, { recursive: true });

      // Download the image
      const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

      // Write to disk safely
      await fs.writeFile(filepath, response.data);

      // Small delay to ensure Windows releases file lock
      await new Promise((r) => setTimeout(r, 50));

      // Set embed image & attach
      embed.setImage(`attachment://${filename}`);
      sendOptions.files = [{ attachment: filepath, name: filename }];

      // Ensure components array
      sendOptions.components = Array.isArray(components)
        ? components
        : components
        ? [components]
        : [];

      try {
        // Attempt sending the message
        await channel.send(sendOptions);
      } catch (sendErr) {
        console.warn("[WARN] File attachment failed, retrying in-memory upload...");

        // Retry with in-memory buffer
        sendOptions.files = [
          { attachment: Buffer.from(response.data), name: filename },
        ];
        await channel.send(sendOptions);
      }

      // Attempt cleanup after a short delay (file lock safe)
      setTimeout(async () => {
        try {
          await fs.unlink(filepath);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.warn(`[WARN] Failed to delete temp file: ${filepath}`, err);
          }
        }
      }, 500);
    } else {
      // No image: just send embed
      sendOptions.components = Array.isArray(components)
        ? components
        : components
        ? [components]
        : [];
      await channel.send(sendOptions);
    }
  } catch (error) {
    console.error("[ERROR] Failed to send embed with image", error);
  }
}
