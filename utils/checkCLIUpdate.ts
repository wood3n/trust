import ora from "ora";
import boxen from "boxen";
import chalk from "chalk";
import getCLIVersion from "./getCLIVersion";

export default async function checkCLIUpdate() {
  const spinner = ora("Checking CLI latest version...").start();
  const { local, latest, error } = await getCLIVersion();

  if (error) {
    spinner.fail("Failed to check for updates");
  } else if (local !== latest) {
    spinner.warn(boxen(`New version available ${chalk.magenta(local)} → ${chalk.green(latest)}`));
  } else {
    spinner.succeed("Your local version is latest");
  }
}
