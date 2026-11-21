import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const SUPPORTED_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
]);

interface HookArgs {
  readonly Path?: string;
  readonly TargetFile?: string;
  readonly file_path?: string;
  readonly path?: string;
}

interface AntigravityHookPayload {
  readonly error?: string;
  readonly toolCall?: {
    readonly args?: HookArgs;
  };
}

const isOptionalString = (value: unknown): value is string | undefined =>
  value === undefined || typeof value === "string";

const isHookArgs = (value: unknown): value is HookArgs =>
  typeof value === "object" &&
  value !== null &&
  isOptionalString("Path" in value ? value.Path : undefined) &&
  isOptionalString("path" in value ? value.path : undefined) &&
  isOptionalString("file_path" in value ? value.file_path : undefined) &&
  isOptionalString("TargetFile" in value ? value.TargetFile : undefined);

const isAntigravityHookPayload = (
  value: unknown
): value is AntigravityHookPayload => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!isOptionalString("error" in value ? value.error : undefined)) {
    return false;
  }

  if (!("toolCall" in value) || value.toolCall === undefined) {
    return true;
  }

  const { toolCall } = value;

  if (typeof toolCall !== "object" || toolCall === null) {
    return false;
  }

  if (!("args" in toolCall) || toolCall.args === undefined) {
    return true;
  }

  return isHookArgs(toolCall.args);
};

const extractEditedPath = (raw: string): string | null => {
  if (raw.trim().length === 0) {
    return null;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isAntigravityHookPayload(parsed)) {
    return null;
  }

  if (parsed.error !== undefined && parsed.error.length > 0) {
    return null;
  }

  const args = parsed.toolCall?.args;

  const candidate =
    args?.Path ?? args?.path ?? args?.file_path ?? args?.TargetFile;

  return candidate !== undefined && candidate.length > 0 ? candidate : null;
};

const readStdin = async (): Promise<string> => {
  if (process.stdin.isTTY) {
    return "";
  }

  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }

  return Buffer.concat(chunks).toString("utf-8");
};

const repoRoot = path.resolve(import.meta.dirname, "..");

const main = async (): Promise<void> => {
  const raw = await readStdin();
  const targetPath = extractEditedPath(raw);

  if (targetPath !== null) {
    const resolvedTarget = path.resolve(repoRoot, targetPath);
    const relativeTarget = path.relative(repoRoot, resolvedTarget);

    const insideRepo =
      relativeTarget !== "" &&
      relativeTarget !== ".." &&
      !relativeTarget.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativeTarget);

    if (
      insideRepo &&
      fs.existsSync(resolvedTarget) &&
      SUPPORTED_EXTENSIONS.has(path.extname(resolvedTarget).toLowerCase())
    ) {
      const binName = process.platform === "win32" ? "bunx.exe" : "bunx";

      const result = spawnSync(
        binName,
        ["--no-install", "ultracite", "fix", relativeTarget],
        {
          cwd: repoRoot,
          encoding: "utf-8",
        }
      );

      if (result.error !== undefined) {
        process.stderr.write(
          `ultracite post-edit hook failed: ${result.error.message}\n`
        );
        process.stdout.write("{}\n");
        process.exit(1);
      }

      if (result.signal !== null) {
        process.stderr.write(
          `ultracite post-edit hook terminated by signal ${result.signal}\n`
        );
        process.stdout.write("{}\n");
        process.exit(1);
      }

      if (result.status !== 0) {
        const diagnostics = [result.stdout, result.stderr]
          .filter((segment) => segment.trim().length > 0)
          .join("\n")
          .trim();

        if (diagnostics.length > 0) {
          process.stderr.write(`${diagnostics}\n`);
        }

        process.stdout.write("{}\n");
        process.exit(result.status ?? 1);
      }
    }
  }

  process.stdout.write("{}\n");
};

await main();
