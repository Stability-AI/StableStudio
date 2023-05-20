/* eslint-disable import/no-extraneous-dependencies */
import path from "path";

import chalk from "chalk";

import type { PackageManager } from "./helpers/get-pkg-manager";
import { tryGitInit } from "./helpers/git";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";

import { installTemplate, TemplateType } from "./templates";

export async function createPlugin({
  pluginName,
  pluginPath,
  packageManager,
  template = "default",
}: {
  pluginName: string;
  pluginPath: string;
  packageManager: PackageManager;
  example?: string;
  examplePath?: string;
  template?: TemplateType;
}): Promise<void> {
  const root = path.resolve(pluginPath);

  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The plugin path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = path.basename(root);

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  console.log(`Creating a new StableStudio plugin in ${chalk.green(root)}.`);
  console.log();

  process.chdir(root);

  await installTemplate({
    pluginName,
    root,
    packageManager,
    template,
  });

  if (tryGitInit(root)) {
    console.log("Initialized a git repository.");
    console.log();
  }

  console.log();
}
