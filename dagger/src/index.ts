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
  /*
  Prod part :

  Publish : install dependencies, run tests, sonar, build, publish
  Build : install dependencies, run tests, sonar, build,
  */

  @func()
  async publish(
    source: Directory,
    version: string,
    token: Secret,
    url_sonar: string,
    token_sonar: Secret
  ): Promise<void> {
    // Build the source code
    const buildOutput = await this.build(source, url_sonar, token_sonar);

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
  async build(
    source: Directory,
    url: string,
    token: Secret
  ): Promise<Directory> {
    const preBuild = await this.minimal(source, url, token);
    const buildContainer = preBuild.withExec([
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
  /*
  Dev part :

  Minimal : install dependencies, run tests, sonar
  Sonar : run sonar
  Test : run bun tests 
  Build : run bun build
  */

  @func()
  async minimal(
    source: Directory,
    url: string,
    token: Secret
  ): Promise<Container> {
    // Install dependencies and get container in variable for return
    const preBuild = this.buildEnv(source);
    // Run tests and push in variable for get directory with code coverage
    const unitTest = await this.test(source);
    // Run sonar 
    await this.sonar(unitTest, url, token);
    // Return the container bun install
    return preBuild;
  }

  @func()
  async sonar(source: Directory, url: string, token: Secret): Promise<string> {
    return dag
      .container()
      .from("sonarsource/sonar-scanner-cli")
      .withUser("root")
      .withDirectory("/usr/src", source)
      .withSecretVariable("SONAR_TOKEN", token)
      .withEnvVariable("SONAR_HOST_URL", url)
      .withExec(["sonar-scanner"])
      .stdout();
  }

  @func()
  async test(source: Directory): Promise<Directory> {
    return this.buildEnv(source).withExec(["bun", "test"]).directory("/src");
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
