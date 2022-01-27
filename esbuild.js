const esbuild = require("esbuild");
const chalk = require("chalk");
const ora = require("ora");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

function build() {
  const spinner = ora(chalk.cyan("start compiling...")).start();

  esbuild
    .build({
      entryPoints: ["scripts/index.ts"],
      bundle: true,
      minify: true,
      platform: "node",
      sourcemap: true,
      target: ["node14"],
      loader: {
        ".ts": "ts",
      },
      tsconfig: "tsconfig.json",
      plugins: [nodeExternalsPlugin()],
      outfile: "lib/index.js",
    })
    .then(() => {
      spinner.succeed(chalk.green("compiled success"));
    })
    .catch(err => {
      spinner.fail("compiled failed");
      console.log();
      console.log(err);
      process.exit(1);
    });
}

build();
