import fs from "fs";
import {createHash} from "crypto";
import path from "path";

const verify = async () => {
  const checksumsPath = path.resolve("./src/hash/checksums.json");
  const checksumsData = await fs.promises.readFile(checksumsPath, "utf8");
  const checksums = JSON.parse(checksumsData);

  const dir = path.dirname(checksumsPath);

  for (const [fileName, expectedHash] of Object.entries(checksums)) {
    const absolutePath = path.resolve(dir, fileName);

    try {
      const fileBuffer = await fs.promises.readFile(absolutePath);
      const actualHash = createHash("sha256").update(fileBuffer).digest("hex");
      console.log(
        `${fileName} — ${actualHash === expectedHash ? "OK" : "FAIL"}`,
      );
    } catch (err) {
      console.log(`${fileName} — FAIL`);
    }
  }
};

await verify();
