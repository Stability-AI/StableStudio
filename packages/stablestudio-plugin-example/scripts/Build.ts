import * as ESBuild from "esbuild";

const main = async () => {
  try {
    await ESBuild.build({
      entryPoints: ["src/index.ts"],
      outdir: "lib",
      bundle: true,
      sourcemap: true,
      minify: true,
      splitting: true,
      format: "esm",
      target: ["esnext"],
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

main();
