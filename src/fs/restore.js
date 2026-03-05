import fs from "fs/promises";
import path from "path";

export const restore = async () => {
  const sourceFilePath = "./snapshot.json";
  const restorePath = path.resolve("./workspace_restored");

  try {
    await fs.access(sourceFilePath).catch(() => {
      throw new Error("Source snapshot not found");
    });

    const doesExist = await fs.access(restorePath).then(() => true).catch(() => false);
    if (doesExist) {
      throw new Error("FS operation failed");
    }

    const jsonText = await fs.readFile(sourceFilePath, "utf-8");
    const {entries} = JSON.parse(jsonText);

    await fs.mkdir(restorePath, {recursive: true});
    for (const entry of entries) {
      const fullPath = path.join(restorePath, entry.path);

      if (entry.type === "directory") {
        await fs.mkdir(fullPath, {recursive: true});
      } else if (entry.type === "file") {
        await fs.mkdir(path.dirname(fullPath), {recursive: true});

        const decodedContent = Buffer.from(entry.content, "base64");
        await fs.writeFile(fullPath, decodedContent);
      }
    }
  } catch (err) {
    throw new Error("FS operation failed");
  }
};

await restore();
