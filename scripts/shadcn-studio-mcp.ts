import { spawn } from "node:child_process";
import process from "node:process";

const ALLOWED_RUNTIME_ENV_KEYS = new Set([
  "APPDATA",
  "COMSPEC",
  "ComSpec",
  "HOME",
  "HOMEDRIVE",
  "HOMEPATH",
  "HTTPS_PROXY",
  "HTTP_PROXY",
  "LOCALAPPDATA",
  "NO_PROXY",
  "NODE_ENV",
  "NODE_EXTRA_CA_CERTS",
  "NODE_OPTIONS",
  "PATH",
  "PATHEXT",
  "PROGRAMFILES",
  "PROGRAMFILES(X86)",
  "Path",
  "ProgramFiles",
  "ProgramFiles(x86)",
  "SSL_CERT_DIR",
  "SSL_CERT_FILE",
  "SYSTEMDRIVE",
  "SYSTEMROOT",
  "SystemDrive",
  "SystemRoot",
  "TEMP",
  "TMP",
  "TMPDIR",
  "USERPROFILE",
  "WINDIR",
  "http_proxy",
  "https_proxy",
  "no_proxy",
]);

const studioEmail = process.env.SHADCN_STUDIO_EMAIL;
const studioLicenseKey = process.env.SHADCN_STUDIO_LICENSE_KEY;

if (
  studioEmail === undefined ||
  studioEmail.length === 0 ||
  studioLicenseKey === undefined ||
  studioLicenseKey.length === 0
) {
  process.stderr.write(
    "Missing required SHADCN_STUDIO_EMAIL or SHADCN_STUDIO_LICENSE_KEY environment variable.\n"
  );
  process.exit(1);
}

const childEnv: NodeJS.ProcessEnv = {
  NODE_ENV: process.env.NODE_ENV,
};

for (const [key, value] of Object.entries(process.env)) {
  if (
    value !== undefined &&
    (ALLOWED_RUNTIME_ENV_KEYS.has(key) || key.startsWith("npm_config_"))
  ) {
    childEnv[key] = value;
  }
}

childEnv.EMAIL = studioEmail;

childEnv.API_KEY = studioLicenseKey;

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
