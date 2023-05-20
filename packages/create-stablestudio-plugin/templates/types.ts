import { PackageManager } from "../helpers/get-pkg-manager";

export type TemplateType = "default";

export interface GetTemplateFileArgs {
  template: TemplateType;
  file: string;
}

export interface InstallTemplateArgs {
  pluginName: string;
  root: string;
  packageManager: PackageManager;
  template: TemplateType;
}
