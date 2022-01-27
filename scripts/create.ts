import path from "path";
import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";
import inquirer from "inquirer";
import validateProjectName from "validate-npm-package-name";
import Generator from "./Generator";
import { CommanderOptions } from "./typings";

/**
 * 使用hust create生成项目
 * @param appName cli输入的项目名称
 * @param options CLI选项
 */
export default async function (appName: string, options: CommanderOptions) {
  const cwd = process.cwd();
  let projectName = appName;
  const folder = path.resolve(cwd, appName);

  // 在当前文件夹生成项目
  if (appName === ".") {
    projectName = path.resolve("../", cwd);

    const { ok } = await inquirer.prompt([
      {
        name: "ok",
        type: "confirm",
        message: "Generate project in current directory?",
      },
    ]);

    if (!ok) {
      return;
    }
  }

  // 校验项目名称
  const { validForNewPackages, errors, warnings } = validateProjectName(projectName);

  if (!validForNewPackages) {
    console.error(chalk.red(`Invalid project name: "${projectName}"`));
    if (errors) {
      errors.forEach(err => {
        console.error(chalk.red.dim("Error: " + err));
      });
    }

    if (warnings) {
      warnings.forEach(warn => {
        console.error(chalk.red.dim("Warning: " + warn));
      });
    }

    process.exit(1);
  }

  if (fs.existsSync(folder)) {
    const { action } = await inquirer.prompt([
      {
        name: "action",
        type: "list",
        message: `Target directory ${chalk.cyan(folder)} already exists. Please Pick an action:`,
        choices: [
          { name: "Overwrite", value: "overwrite" },
          { name: "Merge", value: "merge" },
          { name: "Cancel", value: false },
        ],
      },
    ]);
    if (!action) {
      return;
    } else if (action === "overwrite") {
      const spinner = ora(`\nRemoving all files in ${chalk.cyan(folder)}...`).start();
      fs.remove(folder)
        .then(() => {
          spinner.succeed("Removed success.");
        })
        .catch(() => {
          spinner.fail("Removing files failed.");
        });
    }
  } else {
    // 创建项目文件夹
    fs.mkdirSync(folder);
  }

  const gte = new Generator(projectName, folder, options);
  gte.generate();
}
