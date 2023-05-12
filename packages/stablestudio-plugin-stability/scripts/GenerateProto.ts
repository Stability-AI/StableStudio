import * as ChildProcess from "child_process";
import * as FileSystem from "fs";
import * as Path from "path";

// Set up input and output directories

const inputDirectoryPath = Path.join(__dirname, "../api-interfaces");
const outputDirectoryPath = Path.join(__dirname, "../src/Proto/Generated");

// Remove and recreate the output directory

FileSystem.existsSync(outputDirectoryPath) &&
  FileSystem.rmSync(outputDirectoryPath, { recursive: true });

FileSystem.mkdirSync(outputDirectoryPath);

// Set up proto directories

const protoDirPath = `${inputDirectoryPath}/src/proto` as const;
const tensorProtoDirPath =
  `${inputDirectoryPath}/src/tensorizer/proto` as const;

// Clone latest tensorizer git repository

const tensorizerGitPath = `${inputDirectoryPath}/src/tensorizer`;

// Clone and force update the api-interfaces Git repository

!FileSystem.existsSync(inputDirectoryPath) &&
  ChildProcess.execSync(
    `git clone https://github.com/Stability-AI/api-interfaces.git ${inputDirectoryPath}`
  );

ChildProcess.execSync("git reset --hard origin/main", {
  cwd: inputDirectoryPath,
});

// Clone and force update the tensorizer Git repository

!FileSystem.existsSync(`${tensorizerGitPath}/.git`) &&
  ChildProcess.execSync(
    `git clone https://github.com/coreweave/tensorizer.git ${tensorizerGitPath}`
  );

ChildProcess.execSync("git reset --hard origin/main", {
  cwd: tensorizerGitPath,
});

// Copy tensors.proto from tensorizer to api-interfaces proto directory

FileSystem.copyFileSync(
  `${tensorProtoDirPath}/tensors.proto`,
  `${protoDirPath}/tensors.proto`
);

// Get all the proto paths and source files

const protoPaths = [
  protoDirPath,
  ...FileSystem.readdirSync(protoDirPath)
    .filter((file) => file.endsWith(".proto"))
    .map((file) => Path.join(protoDirPath, file)),
].join(" ");

// Generate TypeScript files from the final list of proto files

ChildProcess.execSync(
  `npx protoc --ts_out ${outputDirectoryPath} --proto_path ${protoPaths}`
);
