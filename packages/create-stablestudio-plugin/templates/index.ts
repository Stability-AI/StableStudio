import fs from "fs";
import path from "path";

import chalk from "chalk";
import cpy from "cpy";

import { install } from "../helpers/install";

import { GetTemplateFileArgs, InstallTemplateArgs } from "./types";

/**
 * Get the file path for a given file in a template, e.g. "next.config.js".
 */
export const getTemplateFile = ({
  template,
  file,
}: GetTemplateFileArgs): string => {
  return path.join(__dirname, "tenplates", template, file);
};

/**
 * Install a Next.js internal template to a given `root` directory.
 */
export const installTemplate = async ({
  pluginName,
  root,
  packageManager,
  template,
}: InstallTemplateArgs) => {
  console.log(chalk.bold(`Using ${packageManager}.`));

  /**
   * Copy the template files to the target directory.
   */
  console.log("\nInitializing plugin with template:", template, "\n");
  const templatePath = path.join(__dirname, "templates", template);
  const copySource = ["**"];

  await cpy(copySource, root, {
    parents: true,
    cwd: templatePath,
    rename: (name) => {
      switch (name) {
        case "gitignore":
        case "eslintrc.json": {
          return ".".concat(name);
        }
        default: {
          return name;
        }
      }
    },
  });

  /**
   * pull out package.json and add the plugin name
   */
  const packagejson = JSON.parse(
    fs.readFileSync(path.join(root, "packagejson"), "utf8")
  );

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: pluginName,
        ...packagejson,
      },
      null,
      2
    )
  );

  fs.unlinkSync(path.join(root, "packagejson"));

  /**
   * These flags will be passed to `install()`, which calls the package manager
   * install process.
   */
  const installFlags = { packageManager };

  /**
   * Install package.json dependencies if they exist.
   */
  const pkgPath = path.join(root, "package.json");
  if (fs.existsSync(pkgPath)) {
    console.log("Installing dependencies...");
    await install(root, installFlags);
  }
};

export * from "./types";
