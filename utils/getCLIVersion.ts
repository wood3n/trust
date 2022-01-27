// 检查CLI当前版本和最新版本
import pkg from "../package.json";
import latestVersion from "latest-version";

export default async function getCLIVersion() {
  const local = pkg.version;

  let latest = local;
  // 开发环境
  if (process.env.CLI_DEBUG) {
    return {
      local,
      latest,
    };
  }

  let error;
  try {
    latest = await latestVersion(pkg.name);
  } catch (err) {
    error = err;
  }

  return {
    local,
    latest,
    error,
  };
}
