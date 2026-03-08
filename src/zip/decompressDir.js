import fs from "fs";
import path from "path";
import {createBrotliDecompress} from "zlib";

export const decompressDir = async () => {
  const archive = path.resolve("./compressed/archive.br");
  const outputDir = path.resolve("./decompressed");
  try {
    await fs.promises.access(archive);
  } catch {
    throw new Error("FS operation failed");
  }

  await fs.promises.mkdir(outputDir, {recursive: true});

  const readStream = fs.createReadStream(archive);
  const brotli = createBrotliDecompress();
  readStream.pipe(brotli);

  let buffer = Buffer.alloc(0);
  let currentFile = null;
  let remainingBytes = 0;
  let writeStream = null;
  let headerLength = null;

  brotli.on("data", async (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);

    while (buffer.length) {
      if (headerLength === null) {
        if (buffer.length < 4) break;
        headerLength = buffer.readUInt32BE(0);
        buffer = buffer.subarray(4);
      }
      if (!currentFile) {
        if (buffer.length < headerLength) break; // wait for full header
        const headerBuf = buffer.subarray(0, headerLength);
        const meta = JSON.parse(headerBuf.toString());
        buffer = buffer.subarray(headerLength);
        headerLength = null;

        const filePath = path.join(outputDir, meta.path);
        await fs.promises.mkdir(path.dirname(filePath), {recursive: true});
        writeStream = fs.createWriteStream(filePath);
        currentFile = filePath;
        remainingBytes = meta.size;
      }

      if (buffer.length < remainingBytes) {
        writeStream.write(buffer);
        remainingBytes -= buffer.length;
        buffer = Buffer.alloc(0);
        break;
      }

      const fileChunk = buffer.subarray(0, remainingBytes);
      writeStream.write(fileChunk);
      writeStream.end();

      buffer = buffer.subarray(remainingBytes);
      currentFile = null;
      remainingBytes = 0;
      writeStream = null;
    }
  });

  await new Promise((resolve) => brotli.on("end", resolve));
};

decompressDir();
