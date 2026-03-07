import fs from "fs";
import {Transform} from "stream";

const split = () => {
  const linesIndex = process.argv.indexOf("--lines");
  const linesNumber =
    linesIndex !== -1 ? parseInt(process.argv[linesIndex + 1]) : 10;

  const reader = fs.createReadStream("source.txt");

  let leftData = "";
  let lineCount = 0;
  let fileIndex = 1;

  let writer = fs.createWriteStream(`chunk_${fileIndex}.txt`);

  const transformer = new Transform({
    transform(chunk, _, callback) {
      const data = leftData + chunk.toString();
      const lines = data.split("\n");

      leftData = lines.pop();

      for (const line of lines) {
        writer.write(line + "\n");
        lineCount++;

        if (lineCount >= linesNumber) {
          writer.end();
          fileIndex++;
          writer = fs.createWriteStream(`chunk_${fileIndex}.txt`);
          lineCount = 0;
        }
      }

      callback();
    },

    flush(callback) {
      if (leftData) writer.write(leftData + "\n");
      writer.end();
      callback();
    },
  });

  reader.pipe(transformer);
};

split();
