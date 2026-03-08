import {Transform} from "stream";

const lineNumberer = () => {
  let lineNumber = 1;
  let leftData = "";

  const transformer = new Transform({
    transform(chunk, _, callback) {
      const data = leftData + chunk.toString();
      const lines = data.split("\n");

      leftData = lines.pop();

      const linesWithNumber = lines
        .map((line) => `${lineNumber++} | ${line}`)
        .join("\n");

      callback(null, linesWithNumber + "\n");
    },

    flush(callback) {
      if (leftData) {
        callback(null, `${lineNumber} | ${leftData}\n`);
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

lineNumberer();
