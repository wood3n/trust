const esbuild = require("esbuild");
const chalk = require("chalk");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

esbuild
  .build({
    entryPoints: ["scripts/index.js"],
    bundle: true,
    minify: true,
    platform: "node",
    sourcemap: true,
    target: ["node14"],
    plugins: [nodeExternalsPlugin()],
    outfile: "lib/index.js",
  })
  .then(() => {
    console.log(chalk.green("compiled success"));
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
