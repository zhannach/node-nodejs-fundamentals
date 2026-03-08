const progress = () => {
  const args = process.argv.slice(2);
  const getArg = (cliOption, defaultValue) => {
    const index = args.indexOf(cliOption);
    return index !== -1 ? args[index + 1] : defaultValue;
  };

  const duration = parseInt(getArg("--duration", 5000));
  const interval = parseInt(getArg("--interval", 100));
  const barLength = parseInt(getArg("--length", 30));
  const rawColor = getArg("--color", null);

  let colorStart = "";
  const colorEnd = "\x1b[0m";
  const cleanHex = rawColor.trim().replace("#", "");

  if (/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    colorStart = `\x1b[38;2;${r};${g};${b}m`;
  }

  const startTime = Date.now();

  const timer = setInterval(() => {
    const now = Date.now();
    const msPassed = now - startTime;
    const percentRaw = Math.min(msPassed / duration, 1);

    const filledCount = Math.floor(percentRaw * barLength);
    const emptyCount = barLength - filledCount;
    const displayPercent = Math.floor(percentRaw * 100);

    const filledPart = `${colorStart}${"█".repeat(filledCount)}${colorEnd}`;
    const emptyPart = " ".repeat(emptyCount);

    process.stdout.write(`\r[${filledPart}${emptyPart}] ${displayPercent}%`);

    if (percentRaw >= 1) {
      clearInterval(timer);
      process.stdout.write("\nDone!\n");
    }
  }, interval);
};

progress();
