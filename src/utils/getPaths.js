import fs from "fs";
import path from "path";

// Function to get all file paths in a specified directory
export const getFilePaths = (directory) => {
  const filePath = []; // Initialize an array to store file paths
  const files = fs.readdirSync(directory, { withFileTypes: true }); // Read the directory contents

  // Iterate over each item in the directory
  for (const file of files) {
    // Check if the item is a file
    if (file.isFile()) {
      // If it is a file, join the directory path with the file name and add it to the array
      filePath.push(path.join(directory, file.name));
    }
  }

  return filePath; // Return the array of file paths
};

// Function to get all folder paths in a specified directory
export const getFolderPaths = (directory) => {
  const folderPath = []; // Initialize an array to store folder paths
  const files = fs.readdirSync(directory, { withFileTypes: true }); // Read the directory contents

  // Iterate over each item in the directory
  for (const file of files) {
    // Check if the item is a directory
    if (file.isDirectory()) {
      // If it is a directory, join the directory path with the folder name and add it to the array
      folderPath.push(path.join(directory, file.name));
    }
  }

  return folderPath; // Return the array of folder paths
};
