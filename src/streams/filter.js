import {Transform} from "stream";

const filter = () => {
  const patternIndex = process.argv.indexOf("--pattern");
  const pattern = patternIndex !== -1 ? process.argv[patternIndex + 1] : "";
  let leftData = "";

  const transformer = new Transform({
    transform(chunk, _, callback) {
      const data = leftData + chunk.toString();
      const lines = data.split("\n");

      leftData = lines.pop();

      const filtered = lines
        .filter((line) => line.includes(pattern))
        .join("\n");

      if (filtered) callback(null, filtered + "\n");
      else callback();
    },

    flush(callback) {
      if (leftData && leftData.includes(pattern)) {
        callback(null, leftData + "\n");
      } else {
        callback();
      }
    },
  });

  process.stdin.pipe(transformer).pipe(process.stdout);
};

filter();
