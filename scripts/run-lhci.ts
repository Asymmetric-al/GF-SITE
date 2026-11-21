import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const [profile] = process.argv.slice(2);

if (profile !== "mobile" && profile !== "desktop") {
  process.stderr.write("Usage: bun scripts/run-lhci.ts <mobile|desktop>\n");
  process.exit(1);
}

const getChromeCandidates = (): readonly string[] => {
  if (process.platform === "win32") {
    return [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
  }

  if (process.platform === "darwin") {
    return ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
  }

  return [
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];
};

const resolveChromePath = (): string | undefined => {
  const configured = process.env.CHROME_PATH;

  if (configured !== undefined && configured.length > 0) {
    return configured;
  }

  return getChromeCandidates().find((candidate) => fs.existsSync(candidate));
};

const repoRoot = path.resolve(import.meta.dirname, "..");
const chromePath = resolveChromePath();
const env: NodeJS.ProcessEnv = { ...process.env };

if (chromePath !== undefined) {
  env.CHROME_PATH = chromePath;
}

const configPath = path.join(repoRoot, `lighthouserc.${profile}.json`);
const bin = process.platform === "win32" ? "bunx.exe" : "bunx";

const result = spawnSync(
  bin,
  ["--no-install", "lhci", "autorun", `--config=${configPath}`],
  {
    cwd: repoRoot,
    env,
    stdio: "inherit",
  }
);

if (result.error !== undefined) {
  process.stderr.write(`Failed to execute lhci: ${result.error.message}\n`);
  process.exit(1);
}

if (result.signal !== null) {
  process.stderr.write(`lhci terminated by signal ${result.signal}\n`);
  process.exit(1);
}

process.exit(result.status ?? 1);
