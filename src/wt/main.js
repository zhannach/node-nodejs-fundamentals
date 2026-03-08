import fs from "fs/promises";
import os from "os";
import {Worker} from "worker_threads";

const main = async () => {
  const sourceFile = await fs.readFile("./data.json", "utf-8");
  const data = JSON.parse(sourceFile);

  const cpuCores = os.cpus().length;

  const chunkSize = Math.ceil(data.length / cpuCores);
  const chunks = [];

  for (let i = 0; i < cpuCores; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = data.slice(start, end);

    if (chunk.length) {
      chunks.push(chunk);
    }
  }
  const sortedChunks = new Array(chunks.length);

  const workers = chunks.map((chunk, index) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL("./worker.js", import.meta.url));

      worker.postMessage(chunk);

      worker.on("message", (sorted) => {
        sortedChunks[index] = sorted;
        resolve();
      });

      worker.on("error", reject);
    });
  });
  await Promise.all(workers);

  const result = mergeSortedArrays(sortedChunks);
  console.log(result);
};

const mergeSortedArrays = (arrays) => {
  const result = [];
  const indices = new Array(arrays.length).fill(0);

  while (true) {
    let minValue = Infinity;
    let minIndex = -1;

    for (let i = 0; i < arrays.length; i++) {
      const index = indices[i];

      if (index < arrays[i].length && arrays[i][index] < minValue) {
        minValue = arrays[i][index];
        minIndex = i;
      }
    }

    if (minIndex === -1) break;

    result.push(minValue);
    indices[minIndex]++;
  }

  return result;
};

await main();
