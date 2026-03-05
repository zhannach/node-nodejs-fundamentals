import fs from "fs/promises";
import path from "path";

const checkExists = async (filePath) => {
  try {
    await fs.access(filePath);
  } catch {
    throw new Error("FS operation failed");
  }
};

const merge = async () => {
  const partsDir = path.resolve("parts");
  const outputFile = path.resolve("merged.txt");

  await checkExists(partsDir);

  const filesIndex = process.argv.findIndex((arg) => arg === "--files");
  let filesArg = null;

  if (filesIndex !== -1 && process.argv[filesIndex + 1]) {
    filesArg = process.argv[filesIndex + 1];
  } else if (process.argv[2] && process.argv[2].includes(".txt")) {
    filesArg = process.argv[2];
  }

  let filesToMerge;

  if (filesArg) {
    filesToMerge = process.argv[filesIndex + 1].split(",").map((f) => f.trim());

    for (const file of filesToMerge) {
      await checkExists(path.join(partsDir, file));
    }
  } else {
    const allEntries = await fs.readdir(partsDir, {withFileTypes: true});
    filesToMerge = allEntries
      .filter((e) => e.isFile() && e.name.endsWith(".txt"))
      .map((e) => e.name)
      .sort();

    if (filesToMerge.length === 0) {
      throw new Error("FS operation failed");
    }
  }

  let mergedContent = "";
  for (const file of filesToMerge) {
    const filePath = path.join(partsDir, file);
    const content = await fs.readFile(filePath, "utf8");
    mergedContent += content;
  }

  await fs.writeFile(outputFile, mergedContent, "utf8");
};

await merge();
