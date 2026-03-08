import {spawn} from "child_process";

const execCommand = () => {
  const commandString = process.argv[2];

  const child = spawn(commandString, {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code);
  });
};

execCommand();
