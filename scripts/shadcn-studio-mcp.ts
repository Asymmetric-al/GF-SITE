import { spawn } from "node:child_process";
import process from "node:process";

const studioEmail = process.env.SHADCN_STUDIO_EMAIL;
const studioLicenseKey = process.env.SHADCN_STUDIO_LICENSE_KEY;

const childEnv: NodeJS.ProcessEnv = {
  ...process.env,
};

if (studioEmail !== undefined && studioEmail.length > 0) {
  childEnv.EMAIL = studioEmail;
}

if (studioLicenseKey !== undefined && studioLicenseKey.length > 0) {
  childEnv.API_KEY = studioLicenseKey;
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(command, ["-y", "shadcn-studio-mcp@1.0.7"], {
  env: childEnv,
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.on("error", (error) => {
  process.stderr.write(`Failed to start shadcn-studio-mcp: ${error.message}\n`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal !== null) {
    process.kill(process.pid, signal);

    return;
  }

  process.exit(code ?? 0);
});
