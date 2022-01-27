import { log } from "console";
import chalk from "chalk";

export default {
  info(msg: string) {
    log(chalk.cyan(msg));
  },
  success(msg: string) {
    log(chalk.green(msg));
  },
  error(err: string) {
    log(chalk.red(err));
  },
  warn(warn: string) {
    log(chalk.yellow(warn));
  },
};
