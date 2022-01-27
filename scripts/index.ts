import registerCommand from "./commander";
import { checkNodeVersion, checkCLIUpdate } from "../utils";

if (process.env.NODE_ENV === "production") {
  // 检查本地node版本
  checkNodeVersion();

  // 检查CLI版本
  checkCLIUpdate();
}

registerCommand();

export { defineConfig } from "./typings";
