#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
import fs from "fs";
import path from "path";

import chalk from "chalk";
import Commander from "commander";
import Conf from "conf";
import prompts from "prompts";
import checkForUpdate from "update-check";

import { createPlugin } from "./create-plugin";
import { getPkgManager } from "./helpers/get-pkg-manager";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { validateNpmName } from "./helpers/validate-pkg";
import packageJson from "./package.json";

let projectPath = "";

const handleSigTerm = () => process.exit(0);

process.on("SIGINT", handleSigTerm);
process.on("SIGTERM", handleSigTerm);

const onPromptState = (state: any) => {
  if (state.aborted) {
    // If we don't re-enable the terminal cursor before exiting
    // the program, the cursor will remain hidden
    process.stdout.write("\x1B[?25h");
    process.stdout.write("\n");
    process.exit(1);
  }
};

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments("<project-directory>")
  .usage(`${chalk.green("<project-directory>")} [options]`)
  .action((name) => {
    projectPath = name;
  })
  .option(
    "--use-npm",
    `

  Explicitly tell the CLI to bootstrap the application using npm
`
  )
  .option(
    "--use-pnpm",
    `

  Explicitly tell the CLI to bootstrap the application using pnpm
`
  )
  .option(
    "--use-yarn",
    `

  Explicitly tell the CLI to bootstrap the application using Yarn
`
  )
  .allowUnknownOption()
  .parse(process.argv);

const packageManager = !!program.useNpm
  ? "npm"
  : !!program.usePnpm
  ? "pnpm"
  : !!program.useYarn
  ? "yarn"
  : getPkgManager();

async function run(): Promise<void> {
  const conf = new Conf({ projectName: "create-stablestudio-plugin" });

  if (typeof projectPath === "string") {
    projectPath = projectPath.trim();
  }

  if (!projectPath) {
    const res = await prompts({
      onState: onPromptState,
      type: "text",
      name: "path",
      message: "What is your plugin called?",
      initial: "my-plugin",
      validate: (name) => {
        const validation = validateNpmName(path.basename(path.resolve(name)));
        if (validation.valid) {
          return true;
        }
        return "Invalid plugin name: " + validation.problems?.[0];
      },
    });

    if (typeof res.path === "string") {
      projectPath = res.path.trim();
    }
  }

  if (!projectPath) {
    console.log(
      "\nPlease specify the plugin directory:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          "<project-directory>"
        )}\n` +
        "For example:\n" +
        `  ${chalk.cyan(program.name())} ${chalk.green(
          "my-stablestudio-plugin"
        )}\n\n` +
        `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`
    );
    process.exit(1);
  }

  const resolvedProjectPath = path.resolve(projectPath);
  const projectName = path.basename(resolvedProjectPath);

  const { valid, problems } = validateNpmName(projectName);
  if (!valid) {
    console.error(
      `Could not create a plugin called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    );

    problems?.forEach((p) => console.error(`    ${chalk.red.bold("*")} ${p}`));
    process.exit(1);
  }

  /**
   * Verify the project dir is empty or doesn't exist
   */
  const root = path.resolve(resolvedProjectPath);
  const appName = path.basename(root);
  const folderExists = fs.existsSync(root);

  if (folderExists && !isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const preferences = (conf.get("preferences") || {}) as Record<
    string,
    boolean | string
  >;

  await createPlugin({
    pluginName: projectName,
    pluginPath: resolvedProjectPath,
    packageManager,
  });

  conf.set("preferences", preferences);
}

const update = checkForUpdate(packageJson).catch(() => null);

async function notifyUpdate(): Promise<void> {
  try {
    const res = await update;
    if (res?.latest) {
      const updateMessage =
        packageManager === "yarn"
          ? "yarn global add create-stablestudio-plugin"
          : packageManager === "pnpm"
          ? "pnpm add -g create-stablestudio-plugin"
          : "npm i -g create-stablestudio-plugin";

      console.log(
        chalk.yellow.bold(
          "A new version of `create-stablestudio-plugin` is available!"
        ) +
          "\n" +
          "You can update by running: " +
          chalk.cyan(updateMessage) +
          "\n"
      );
    }
    process.exit();
  } catch {
    // ignore error
  }
}

run()
  .then(notifyUpdate)
  .catch(async (reason) => {
    console.log();
    console.log("Aborting installation.");
    if (reason.command) {
      console.log(`  ${chalk.cyan(reason.command)} has failed.`);
    } else {
      console.log(
        chalk.red("Unexpected error. Please report it as a bug:") + "\n",
        reason
      );
    }
    console.log();

    await notifyUpdate();

    process.exit(1);
  });
