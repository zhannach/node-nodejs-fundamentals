const dynamic = async () => {
  const pluginName = process.argv[2];
  try {
    const plugin = await import(`./plugins/${pluginName}.js`);
    const resultString = plugin.run();
    console.log(resultString);
  } catch (error) {
    console.log("Plugin not found");
    process.exit(1);
  }
};

await dynamic();
