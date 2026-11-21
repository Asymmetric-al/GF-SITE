import { spawnSync } from "node:child_process";
import fs from "node:fs";
import process from "node:process";

const [profile] = process.argv.slice(2);

if (profile !== "mobile" && profile !== "desktop") {
  process.stderr.write("Usage: bun scripts/run-lhci.ts <mobile|desktop>\n");
  process.exit(1);
}

const resolveChromePath = (): string | undefined => {
  const configured = process.env.CHROME_PATH;

  if (configured !== undefined && configured.length > 0) {
    return configured;
  }

  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
        ];

  return candidates.find((candidate) => fs.existsSync(candidate));
};

const chromePath = resolveChromePath();
const env: NodeJS.ProcessEnv = { ...process.env };

if (chromePath !== undefined) {
  env.CHROME_PATH = chromePath;
}

const configPath = `./lighthouserc.${profile}.json`;
const bin = process.platform === "win32" ? "bunx.exe" : "bunx";

const result = spawnSync(
  bin,
  ["--no-install", "lhci", "autorun", `--config=${configPath}`],
  {
    env,
    stdio: "inherit",
  }
);

if (result.error !== undefined) {
  process.stderr.write(`Failed to execute lhci: ${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status ?? 0);
