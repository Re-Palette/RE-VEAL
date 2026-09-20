#!/usr/bin/env node
/**
 * Preflight for Google sign-in.
 *
 *   node scripts/check-auth.mjs
 *   node scripts/check-auth.mjs https://re-veal.vercel.app
 *
 * Reads the same files Next.js reads, reports what is missing, and prints the
 * exact strings to paste into the Google Cloud Console. It never prints a
 * secret value — only enough of one to tell two pastes apart.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

// Next.js load order: the first file to define a key wins.
const ENV_FILES = [".env.local", ".env.development.local", ".env"];

const c = {
  reset: "\u001b[0m",
  dim: "\u001b[2m",
  bold: "\u001b[1m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  cyan: "\u001b[36m",
};

/** Minimal dotenv: KEY=value, optional `export`, optional surrounding quotes. */
function parseEnvFile(path) {
  const out = new Map();
  for (const rawLine of readFileSync(path, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue;
    const quoted = /^(['"])([\s\S]*)\1$/.exec(value);
    if (quoted) value = quoted[2];
    out.set(key, { value, quoted: Boolean(quoted), raw: rawValue });
  }
  return out;
}

const found = new Map(); // key -> { value, quoted, raw, file }
const filesRead = [];
for (const file of ENV_FILES) {
  const path = resolve(ROOT, file);
  if (!existsSync(path)) continue;
  filesRead.push(file);
  for (const [key, entry] of parseEnvFile(path)) {
    if (!found.has(key)) found.set(key, { ...entry, file });
  }
}
// A real environment variable beats every file.
for (const key of ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_SECRET", "AUTH_URL"]) {
  const fromShell = process.env[key];
  if (fromShell) found.set(key, { value: fromShell, quoted: false, raw: fromShell, file: "shell environment" });
}

const problems = [];
const warnings = [];

function mask(value) {
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}${"*".repeat(Math.min(value.length - 8, 24))}${value.slice(-4)}`;
}

function check(key, { required, validate, show }) {
  const entry = found.get(key);
  if (!entry || entry.value === "") {
    if (required) problems.push(`${key} is not set.`);
    else console.log(`  ${c.dim}-${c.reset} ${key} ${c.dim}not set (optional)${c.reset}`);
    return;
  }
  const { value } = entry;
  if (value !== value.trim()) {
    warnings.push(`${key} has leading or trailing whitespace — Google will reject it.`);
  }
  if (entry.quoted) {
    warnings.push(`${key} is wrapped in quotes. That works, but paste values unquoted to avoid confusion.`);
  }
  const problem = validate?.(value.trim());
  if (problem) problems.push(`${key}: ${problem}`);
  const display = show === "full" ? value.trim() : mask(value.trim());
  const mark = problem ? `${c.red}✗${c.reset}` : `${c.green}✓${c.reset}`;
  console.log(`  ${mark} ${key} ${c.dim}= ${display}  (${entry.file})${c.reset}`);
}

const origin = process.argv[2]?.replace(/\/+$/, "");
if (origin && !/^https?:\/\/[^/]+$/.test(origin)) {
  console.error(`${c.red}Pass an origin like https://your-app.vercel.app — not a path.${c.reset}`);
  process.exit(2);
}

console.log(`\n${c.bold}RE:VEAL — Google sign-in preflight${c.reset}`);
console.log(
  filesRead.length
    ? `${c.dim}Read: ${filesRead.join(", ")}${c.reset}\n`
    : `${c.dim}No .env files found in the project root.${c.reset}\n`,
);

check("AUTH_GOOGLE_ID", {
  required: true,
  show: "full",
  validate: (v) => {
    if (v.endsWith(".apps.googleusercontent.com")) return null;
    if (v.startsWith("GOCSPX-")) return "this is the client SECRET, not the ID — the two are swapped.";
    return "does not look like a Google client ID (it should end in .apps.googleusercontent.com).";
  },
});

check("AUTH_GOOGLE_SECRET", {
  required: true,
  validate: (v) => {
    if (v.endsWith(".apps.googleusercontent.com")) return "this is the client ID, not the secret — the two are swapped.";
    if (!v.startsWith("GOCSPX-")) return "Google client secrets normally start with GOCSPX- . Check you copied the secret and not the ID.";
    return null;
  },
});

check("AUTH_SECRET", {
  required: true,
  validate: (v) => (v.length < 32 ? `only ${v.length} characters. Generate one with \`npx auth secret\`.` : null),
});

check("AUTH_URL", {
  required: false,
  show: "full",
  validate: (v) => (/\/api\/auth\/?$/.test(v) ? "should be the site origin only, without /api/auth." : null),
});

const origins = ["http://localhost:3000", origin].filter(Boolean);

console.log(`\n${c.bold}Register these in Google Cloud Console${c.reset}`);
console.log(`${c.dim}APIs & Services → Credentials → your OAuth client (Web application)${c.reset}\n`);
console.log(`  Authorised JavaScript origins`);
for (const o of origins) console.log(`    ${c.cyan}${o}${c.reset}`);
console.log(`\n  Authorised redirect URIs`);
for (const o of origins) console.log(`    ${c.cyan}${o}/api/auth/callback/google${c.reset}`);
if (!origin) {
  console.log(
    `\n  ${c.dim}Re-run with your deployed origin to print its URIs too:${c.reset}\n    ${c.dim}node scripts/check-auth.mjs https://your-app.vercel.app${c.reset}`,
  );
}

if (warnings.length) {
  console.log(`\n${c.yellow}${c.bold}Warnings${c.reset}`);
  for (const w of warnings) console.log(`  ${c.yellow}!${c.reset} ${w}`);
}

if (problems.length) {
  console.log(`\n${c.red}${c.bold}Not ready — sign-in will stay in demo mode${c.reset}`);
  for (const p of problems) console.log(`  ${c.red}✗${c.reset} ${p}`);
  console.log(`\n${c.dim}Fill these into .env.local (copy .env.example to start), then run this again.${c.reset}\n`);
  process.exit(1);
}

console.log(`\n${c.green}${c.bold}Ready.${c.reset} Run \`npm run dev\` and open http://localhost:3000/signin`);
console.log(
  `${c.dim}If Google answers with redirect_uri_mismatch, the redirect URI above is not registered — it must match character for character.${c.reset}\n`,
);
