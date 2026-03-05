import fs from "fs/promises";
import path from "path";

const readRecursively = async (folder, rootPath) => {
  let entries = [];
  let files;
  try {
    files = await fs.readdir(folder, {withFileTypes: true});
  } catch (err) {
    throw new Error("FS operation failed");
  }

  for (const file of files) {
    const fullPath = path.join(folder, file.name);
    const relativePath = path.relative(rootPath, fullPath);

    if (file.isFile()) {
      const stats = await fs.stat(fullPath);
      const contentBuffer = await fs.readFile(fullPath);
      entries.push({
        path: relativePath,
        type: "file",
        size: stats.size,
        content: contentBuffer.toString("base64"),
      });
    } else if (file.isDirectory()) {
      entries.push({
        path: relativePath,
        type: "directory",
      });

      const nestedEntries = await readRecursively(fullPath, rootPath);
      entries = entries.concat(nestedEntries);
    }
  }
  return entries;
};

const snapshot = async () => {
  const data = {};
  data.rootPath = path.resolve(".");

  try {
    data.entries = await readRecursively(".", data.rootPath);
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile("snapshot.json", json);
  } catch (err) {
    console.error(err.message);
  }
};

await snapshot();
