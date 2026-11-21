import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const repoRoot = path.resolve(import.meta.dirname, "..");
const bin = process.platform === "win32" ? "bunx.exe" : "bunx";

const child = spawn(bin, ["--no-install", "shadcn", "mcp"], {
  cwd: repoRoot,
  stdio: "inherit",
});

child.on("error", (error) => {
  process.stderr.write(`Failed to start shadcn MCP: ${error.message}\n`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);

    return;
  }

  process.exit(code ?? 0);
});
