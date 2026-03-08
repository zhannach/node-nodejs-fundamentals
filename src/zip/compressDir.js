import fs from "fs";
import path from "path";
import {createBrotliCompress} from "zlib";

const {promises: fsp} = fs;

async function getFiles(dir, base = dir, result = []) {
  const files = await fsp.readdir(dir, {withFileTypes: true});

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await getFiles(fullPath, base, result);
    } else {
      result.push({
        fullPath,
        relativePath: path.relative(base, fullPath),
      });
    }
  }

  return result;
}

export const compressDir = async () => {
  const sourceDir = path.resolve("./toCompress");
  const outputDir = path.resolve("./compressed");
  const archiveFile = path.join(outputDir, "archive.br");
  try {
    await fsp.access(sourceDir);
  } catch {
    throw new Error("FS operation failed");
  }

  await fsp.mkdir(outputDir, {recursive: true});

  const files = await getFiles(sourceDir);

  const brotli = createBrotliCompress();
  const writeStream = fs.createWriteStream(archiveFile);

  brotli.pipe(writeStream);

  for (const file of files) {
    const stat = await fsp.stat(file.fullPath);
    const headerJson = JSON.stringify({
      path: file.relativePath,
      size: stat.size,
    });
    const headerBuf = Buffer.from(headerJson);

    const headerLengthBuf = Buffer.alloc(4);
    headerLengthBuf.writeUInt32BE(headerBuf.length, 0);

    brotli.write(headerLengthBuf);
    brotli.write(headerBuf);

    await new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(file.fullPath);
      readStream.on("error", reject);
      readStream.on("end", resolve);
      readStream.pipe(brotli, {end: false});
    });
  }

  brotli.end();

  await new Promise((resolve) => writeStream.on("finish", resolve));
};

compressDir();
