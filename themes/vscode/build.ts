import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

// Single orchestrator for the local extension build. Run via `jiti build.ts`, it
// cleans, regenerates themes, compiles, tests, packages a VSIX, and hot-reinstalls
// it into the running editor. Each step prints one aligned status line; the captured
// sub-process output is only shown when a step fails.

// Keep child-process deprecation warnings out of the build log; surface anything else.
process.removeAllListeners("warning");
process.on("warning", (warning) => {
	if (warning.name === "DeprecationWarning") return;
	console.warn(warning.stack ?? warning.message);
});

const repoRoot = __dirname;
const packageJson = JSON.parse(readFileSync(path.join(repoRoot, "package.json"), "utf8")) as {
	publisher: string;
	name: string;
	version: string;
};
const extensionId = `${packageJson.publisher}.${packageJson.name}`;
const vsixPrefix = `${packageJson.name}-`;
const activeCli = detectPreferredVsCodeCli();

const LABEL_WIDTH = 10;
const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;
const c = {
	dim: paint("2", "22"),
	bold: paint("1", "22"),
	red: paint("31", "39"),
	green: paint("32", "39"),
	yellow: paint("33", "39"),
	magenta: paint("35", "39"),
	cyan: paint("36", "39"),
};

void main().catch((error: unknown) => {
	const message = error instanceof Error ? error.message : String(error);
	console.error(`\n  ${c.red("✗ Build failed")}  ${c.dim(message)}\n`);
	process.exit(1);
});

// Drive the full pipeline, surfacing each phase as its own status line.
async function main(): Promise<void> {
	const startedAt = process.hrtime.bigint();
	printHeader();

	await step("Clean", clean);
	await step("Generate", generate);
	await step("Compile", compile);
	await step("Test", runTests);

	let vsixPath = "";
	await step("Package", async () => {
		vsixPath = await packageVsix();
		return null;
	});
	await step("Install", () => installVsix(vsixPath));

	printFooter(startedAt);
}

// Remove the previous compile output and any stale VSIX files left in the project root.
async function clean(): Promise<string | null> {
	const distPath = path.join(repoRoot, "dist");
	if (existsSync(distPath)) {
		await fs.rm(distPath, { recursive: true, force: true });
	}

	await removeExistingVsixes(vsixPrefix);
	return null;
}

// Regenerate the bundled theme JSON from the palette definitions.
async function generate(): Promise<string | null> {
	execOrThrow("jiti", ["palettes/generate.ts"]);
	execOrThrow("jiti", ["palettes/generate-zed.ts"]);
	execOrThrow("jiti", ["palettes/generate-chrome.ts"]);
	return null;
}

// Type-check and emit the runtime sources into dist/.
async function compile(): Promise<string | null> {
	execOrThrow("tsc", ["-p", "./tsconfig.json"]);
	return null;
}

// Run the compiled test suites and report passed/total in place of a duration.
async function runTests(): Promise<string> {
	const result = exec("node", [
		"--test",
		"./dist/test/customization.test.js",
		"./dist/test/theme.test.js",
	]);

	const total = Number(result.output.match(/(?:^|\s)tests (\d+)/)?.[1] ?? 0);
	const pass = Number(result.output.match(/(?:^|\s)pass (\d+)/)?.[1] ?? 0);
	const fail = Number(result.output.match(/(?:^|\s)fail (\d+)/)?.[1] ?? 0);

	if (result.status !== 0 || fail > 0) {
		throw withOutput(new Error(`${fail} test${fail === 1 ? "" : "s"} failed`), result.output);
	}

	return c.dim(`${pass}/${total}`);
}

// Package a fresh VSIX and return its path.
async function packageVsix(): Promise<string> {
	execOrThrow("npx", [
		"--yes",
		"@vscode/vsce",
		"package",
		"--allow-missing-repository",
		"--skip-license",
	]);

	return findBuiltVsix(vsixPrefix);
}

// Replace any installed copy of the extension with the freshly packaged VSIX.
async function installVsix(vsixPath: string): Promise<string | null> {
	if (!activeCli) {
		return c.yellow("skipped · no VS Code CLI");
	}

	if (isExtensionInstalled(activeCli.command, extensionId)) {
		execOrThrow(activeCli.command, ["--uninstall-extension", extensionId]);
	}
	execOrThrow(activeCli.command, ["--install-extension", vsixPath, "--force"]);

	return null;
}

// Delete earlier packages so a later build always resolves a single fresh VSIX.
async function removeExistingVsixes(prefix: string): Promise<number> {
	const entries = await fs.readdir(repoRoot, { withFileTypes: true });
	const targets = entries
		.filter((entry) => entry.isFile())
		.map((entry) => entry.name)
		.filter((name) => name.startsWith(prefix) && name.endsWith(".vsix"));

	for (const fileName of targets) {
		await fs.rm(path.join(repoRoot, fileName), { force: true });
	}

	return targets.length;
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

// Render a step as a single line: a transient marker while it runs, then its result.
async function step(label: string, run: () => Promise<string | null>): Promise<void> {
	const startedAt = process.hrtime.bigint();
	const tty = Boolean(process.stdout.isTTY);

	if (tty) {
		process.stdout.write(`  ${c.dim("○")} ${c.dim(label)}`);
	}

	try {
		const detail = await run();
		const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e6;
		const trailing = detail ?? c.dim(formatDuration(elapsed));
		writeStatus(tty, `  ${c.green("✓")} ${label.padEnd(LABEL_WIDTH)}${trailing}`);
	} catch (error) {
		writeStatus(tty, `  ${c.red("✗")} ${label.padEnd(LABEL_WIDTH)}${c.red("failed")}`);
		const output = (error as { output?: string }).output;
		if (output && output.trim()) {
			console.error(`\n${indent(output.trim())}\n`);
		}
		throw error;
	}
}

// Overwrite the transient marker on a TTY; otherwise print a plain line.
function writeStatus(tty: boolean, line: string): void {
	if (tty) {
		process.stdout.write(`\r\x1b[2K${line}\n`);
	} else {
		console.log(line);
	}
}

function printHeader(): void {
	console.log();
	console.log(`  ${c.bold(c.magenta("Zenkai"))}  ${c.dim(`build · v${packageJson.version}`)}`);
	console.log();
}

function printFooter(startedAt: bigint): void {
	const elapsed = Number(process.hrtime.bigint() - startedAt) / 1e6;
	console.log();
	console.log(`  ${c.green("✓")} ${c.bold("Done")} ${c.dim(`in ${formatDuration(elapsed)}`)}`);
	console.log();
}

// Run a command with captured output, local bins on PATH, and warnings suppressed.
function exec(command: string, args: string[]): { status: number; output: string } {
	const result = spawnSync(command, args, {
		cwd: repoRoot,
		encoding: "utf8",
		shell: process.platform === "win32",
		env: buildEnv(),
	});

	const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
	return { status: result.status ?? 1, output };
}

// Run a command and fail the build if it exits non-zero, attaching its output.
function execOrThrow(command: string, args: string[]): { status: number; output: string } {
	const result = exec(command, args);
	if (result.status !== 0) {
		throw withOutput(new Error(`Command failed: ${command} ${args.join(" ")}`), result.output);
	}
	return result;
}

// Child environment: non-interactive, no deprecation noise, with local .bin resolvable.
function buildEnv(): NodeJS.ProcessEnv {
	const env: NodeJS.ProcessEnv = {
		...process.env,
		CI: "1",
		npm_config_yes: "true",
		NODE_OPTIONS: withNoDeprecation(process.env.NODE_OPTIONS),
	};

	const binDir = path.join(repoRoot, "node_modules", ".bin");
	const pathKey = Object.keys(env).find((key) => key.toLowerCase() === "path") ?? "PATH";
	env[pathKey] = `${binDir}${path.delimiter}${env[pathKey] ?? ""}`;

	return env;
}

function withNoDeprecation(existing: string | undefined): string {
	const flag = "--no-deprecation";
	if (!existing) return flag;
	return existing.includes(flag) ? existing : `${existing} ${flag}`;
}

function withOutput(error: Error, output: string): Error & { output: string } {
	return Object.assign(error, { output });
}

function formatDuration(ms: number): string {
	return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function indent(text: string): string {
	return text
		.split(/\r?\n/)
		.map((line) => `    ${c.dim("│")} ${line}`)
		.join("\n");
}

function paint(open: string, close: string): (value: string) => string {
	return (value) => (useColor ? `\x1b[${open}m${value}\x1b[${close}m` : value);
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
			processNames.includes("code - insiders.exe") ||
			processNames.includes("code-insiders.exe")
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
		return true;
	}

	const installedExtensions = result.stdout
		.split(/\r?\n/)
		.map((line) => line.trim().toLowerCase())
		.filter(Boolean);

	return installedExtensions.includes(extensionIdentifier.toLowerCase());
}
