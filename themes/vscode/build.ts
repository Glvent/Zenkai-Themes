import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Run the local extension packaging flow from the compiled `dist` directory:
// clear stale VSIX files, validate tests, package a fresh VSIX, then refresh the editor install.
const repoRoot = path.resolve(__dirname, "..");
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
  publisher: string;
  name: string;
};
const extensionId = `${packageJson.publisher}.${packageJson.name}`;
const vsixPrefix = `${packageJson.name}-`;
const activeCli = detectPreferredVsCodeCli();

void main();

// Build and hot-reinstall the extension into the preferred local VS Code instance.
async function main(): Promise<void> {
  await removeExistingVsixes(vsixPrefix);
  await uninstallFromEditor(activeCli, extensionId);
  runCommand("npm", ["run", "test:compiled"], { cwd: repoRoot });
  runCommand(
    "npx",
    ["--yes", "@vscode/vsce", "package", "--allow-missing-repository", "--skip-license"],
    {
      cwd: repoRoot,
    }
  );
  const builtVsixPath = await findBuiltVsix(vsixPrefix);
  await installIntoEditor(activeCli, builtVsixPath);
}

// Keep the project root deterministic by removing earlier packages before creating a new one.
async function removeExistingVsixes(prefix: string): Promise<void> {
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  const targets = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".vsix"));

  if (targets.length === 0) {
    console.log("No existing VSIX found in the project root.");
    return;
  }

  for (const fileName of targets) {
    const targetPath = path.join(repoRoot, fileName);

    try {
      await fs.rm(targetPath, { force: true });
      console.log(`Deleted existing VSIX: ${targetPath}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to delete existing VSIX at ${targetPath}: ${message}`);
    }
  }
}

// Uninstall the currently installed extension first so a later install always replaces the same identifier.
async function uninstallFromEditor(
  cli: { command: string } | null,
  extensionIdentifier: string
): Promise<void> {
  if (!cli) {
    console.warn(`Skipped uninstall: could not find a VS Code CLI for ${extensionIdentifier}.`);
    return;
  }

  if (!isExtensionInstalled(cli.command, extensionIdentifier)) {
    console.log(`${extensionIdentifier} is not installed in ${cli.command}.`);
    return;
  }

  console.log(`Uninstalling ${extensionIdentifier} via ${cli.command}...`);
  runCommand(cli.command, ["--uninstall-extension", extensionIdentifier], {
    cwd: repoRoot,
  });
}

// Resolve the newest VSIX produced by `vsce package`.
async function findBuiltVsix(prefix: string): Promise<string> {
  const entries = await fs.readdir(repoRoot, { withFileTypes: true });
  const matches = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.startsWith(prefix) && name.endsWith(".vsix"))
    .sort();

  if (matches.length === 0) {
    throw new Error(`No VSIX was created in ${repoRoot}.`);
  }

  return path.join(repoRoot, matches[matches.length - 1]);
}

// Reinstall the newly built VSIX into whichever editor CLI we detected earlier.
async function installIntoEditor(cli: { command: string } | null, vsixPath: string): Promise<void> {
  if (!cli) {
    console.warn(`Skipped extension refresh: could not find a VS Code CLI to install ${vsixPath}.`);
    return;
  }

  console.log(`Installing ${path.basename(vsixPath)} into ${cli.command}...`);
  runCommand(cli.command, ["--install-extension", vsixPath, "--force"], {
    cwd: repoRoot,
  });
}

// Prefer the CLI that matches a currently running editor, then fall back to any installed CLI.
function detectPreferredVsCodeCli(): { command: string } | null {
  const runningEditors = detectRunningEditors();

  if (runningEditors.includes("code-insiders") && isCommandAvailable("code-insiders")) {
    return { command: "code-insiders" };
  }

  if (runningEditors.includes("code") && isCommandAvailable("code")) {
    return { command: "code" };
  }

  if (isCommandAvailable("code")) {
    return { command: "code" };
  }

  if (isCommandAvailable("code-insiders")) {
    return { command: "code-insiders" };
  }

  return null;
}

// Detect active VS Code processes so packaging can refresh the editor the user is already working in.
function detectRunningEditors(): string[] {
  if (process.platform === "win32") {
    const result = spawnSync("tasklist", ["/FO", "CSV", "/NH"], {
      cwd: repoRoot,
      encoding: "utf8",
    });

    if (result.status !== 0) {
      return [];
    }

    const processNames = result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(parseCsvFirstColumn)
      .map((name) => name.toLowerCase());

    return unique([
      processNames.includes("code - insiders.exe") || processNames.includes("code-insiders.exe")
        ? "code-insiders"
        : null,
      processNames.includes("code.exe") ? "code" : null,
    ]);
  }

  const result = spawnSync("ps", ["-A", "-o", "comm="], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return [];
  }

  const processNames = result.stdout
    .split(/\r?\n/)
    .map((line) => path.basename(line.trim()).toLowerCase())
    .filter(Boolean);

  return unique([
    processNames.some((name) => name === "code-insiders" || name === "code - insiders")
      ? "code-insiders"
      : null,
    processNames.includes("code") ? "code" : null,
  ]);
}

// `tasklist /FO CSV` quotes process names that contain spaces, so parse only the leading column.
function parseCsvFirstColumn(line: string): string {
  if (line.startsWith('"')) {
    const closingQuoteIndex = line.indexOf('",');
    return closingQuoteIndex === -1 ? line.slice(1, -1) : line.slice(1, closingQuoteIndex);
  }

  const commaIndex = line.indexOf(",");
  return commaIndex === -1 ? line : line.slice(0, commaIndex);
}

// Preserve discovery order while stripping null placeholders from platform-specific process checks.
function unique(values: Array<string | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

// Probe whether a CLI exists without printing platform-specific lookup noise.
function isCommandAvailable(command: string): boolean {
  const lookup = process.platform === "win32" ? "where" : "which";
  const result = spawnSync(lookup, [command], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  return result.status === 0;
}

// Treat a failed `--list-extensions` call as installed so the later uninstall attempt is still allowed to proceed.
function isExtensionInstalled(command: string, extensionIdentifier: string): boolean {
  const result = spawnSync(command, ["--list-extensions"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: process.platform === "win32",
  });

  if (result.status !== 0) {
    console.warn(`Skipped extension check: failed to query installed extensions via ${command}.`);
    return true;
  }

  const installedExtensions = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean);

  return installedExtensions.includes(extensionIdentifier.toLowerCase());
}

// Run child processes with CI-friendly defaults and surface failures immediately.
function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; allowFailure?: boolean } = {}
): void {
  const { cwd, allowFailure = false } = options;
  const result = spawnSync(command, args, {
    cwd,
    env: {
      ...process.env,
      CI: "1",
      npm_config_yes: "true",
    },
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.status !== 0 && !allowFailure) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}
