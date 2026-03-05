import fs from "fs/promises";
import path from "path";

const findByExt = async () => {
  // Find extension in CLI command
  const extIndex = process.argv.indexOf("--ext");
  let ext = ".txt";
  const workspace = ".";

  if (extIndex !== -1 && process.argv[extIndex + 1]) {
    const arg = process.argv[extIndex + 1];
    ext = arg.startsWith(".") ? arg : `.${arg}`;
  }

  try {
    await fs.access(workspace);
  } catch {
    throw new Error("FS operation failed");
  }

  const results = [];
  const scanDir = async (dir) => {
    const entries = await fs.readdir(dir, {withFileTypes: true});

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.name.endsWith(ext)) {
        results.push(path.relative(workspace, fullPath));
      }
    }
  };

  await scanDir(workspace);

  results.sort().forEach((file) => console.log(file));
};

await findByExt();
