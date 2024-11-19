import {
  dag,
  Container,
  Directory,
  object,
  func,
  Secret,
} from "@dagger.io/dagger";

@object()
export class LibAclJson {
  @func()
  async publish(
    source: Directory,
    version: string,
    token: Secret
  ): Promise<void> {
    // Build the source code
    const buildOutput = await this.build(source);
    
    const publishContainer = dag
      .container()
      .from("node:lts")
      .withWorkdir("/src")
      .withDirectory("/src", buildOutput)
      //Create environment variable in container
      .withSecretVariable("TOKEN", token)
      // Create .npmrc file
      .withExec([
        "sh",
        "-c",
        'echo "//registry.npmjs.org/:_authToken=${TOKEN}" > /root/.npmrc',
      ])
      // Choose the version to publish
      .withExec(["npm", "version", version, "--no-git-tag-version"])
      // Publish the package
      .withExec(["npm", "publish", "--access public"]);

    await publishContainer.exitCode();
  }

  @func()
  async build(source: Directory): Promise<Directory> {
    const buildContainer = this.buildEnv(source).withExec([
      "bun",
      "build",
      "src/index.ts",
      "--outdir",
      "./dist",
      "--target",
      "node",
    ]);
    const outputDir = buildContainer.directory("/src");

    return outputDir;
  }

  @func()
  async test(source: Directory): Promise<string> {
    return this.buildEnv(source).withExec(["bun", "test"]).stdout();
  }

  @func()
  buildEnv(source: Directory): Container {
    const nodeCache = dag.cacheVolume("node");
    return dag
      .container()
      .from("oven/bun")
      .withDirectory("/src", source)
      .withMountedCache("/root/.npm", nodeCache)
      .withWorkdir("/src")
      .withExec(["bun", "install"]);
  }
}
