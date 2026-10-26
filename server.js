import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8730;
const GH = "https://api.github.com";
const GH_HEADERS = {
  accept: "application/vnd.github+json",
  "user-agent": "shipcheck",
};

// Pull "owner/repo" out of whatever shape gets pasted: full URL, no scheme,
// trailing slash, extra path segments, or bare owner/repo. Null if it does
// not look like a GitHub repo at all.
export function parseRepo(input) {
  if (!input) return null;
  let s = String(input).trim();
  s = s.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (s.toLowerCase().startsWith("github.com/")) s = s.slice("github.com/".length);
  const parts = s.split("/").filter(Boolean);
  if (parts.length < 2) return null;
  const [owner, rawRepo] = parts;
  const repo = rawRepo.replace(/\.git$/i, "");
  if (!/^[\w.-]+$/.test(owner) || !/^[\w.-]+$/.test(repo)) return null;
  return { owner, repo };
}

async function ghJson(path) {
  const res = await fetch(GH + path, { headers: GH_HEADERS });
  if (res.status === 404) return { notFound: true };
  if (!res.ok) throw new Error("github " + res.status);
  return { data: await res.json() };
}

async function ghText(path) {
  const res = await fetch(GH + path, {
    headers: { ...GH_HEADERS, accept: "application/vnd.github.raw+json" },
  });
  if (res.status === 404) return { notFound: true };
  if (!res.ok) throw new Error("github " + res.status);
  return { data: await res.text() };
}

const DOC_FILES = ["scope.md", "prd.md", "spec.md"];

function row(id, label, status, detail) {
  return { id, label, status, detail };
}

export async function runChecks(owner, repo) {
  const base = `/repos/${owner}/${repo}`;
  const repoRes = await ghJson(base);
  if (repoRes.notFound) {
    return {
      repo: `${owner}/${repo}`,
      checks: [
        row("public", "Repo is public", "fix", "Repo not found or not public."),
        row("license", "License present", "skip", "Not run."),
        row("readme", "README present", "skip", "Not run."),
        row("docs", "Planning docs present", "skip", "Not run."),
        row("demo", "Demo or live link present", "skip", "Not run."),
      ],
    };
  }
  const info = repoRes.data;

  const [contentsRes, readmeRes] = await Promise.all([
    ghJson(base + "/contents/"),
    ghText(base + "/readme"),
  ]);
  const rootNames = Array.isArray(contentsRes.data)
    ? contentsRes.data.map((f) => f.name.toLowerCase())
    : [];

  const checks = [];

  checks.push(
    info.private
      ? row("public", "Repo is public", "fix", "Repo is private.")
      : row("public", "Repo is public", "pass", "Public repo, readable without a login.")
  );

  checks.push(
    info.license
      ? row("license", "License present", "pass", `LICENSE found (${info.license.spdx_id || info.license.name}).`)
      : row("license", "License present", "fix", "No license found. Add a LICENSE file; most events require one.")
  );

  const hasReadme = rootNames.some((n) => /^readme(\..+)?$/.test(n));
  checks.push(
    hasReadme
      ? row("readme", "README present", "pass", "README found at the repo root.")
      : row("readme", "README present", "fix", "No README at the repo root.")
  );

  // Planning docs count at the root or inside a devpost/ folder.
  let docNames = new Set(rootNames);
  if (!DOC_FILES.every((d) => docNames.has(d))) {
    const devpostRes = await ghJson(base + "/contents/devpost");
    if (Array.isArray(devpostRes.data)) {
      for (const f of devpostRes.data) docNames.add(f.name.toLowerCase());
    }
  }
  const missingDocs = DOC_FILES.filter((d) => !docNames.has(d));
  checks.push(
    missingDocs.length === 0
      ? row("docs", "Planning docs present", "pass", "scope.md, prd.md, spec.md found.")
      : row("docs", "Planning docs present", "fix", `Missing: ${missingDocs.join(", ")}.`)
  );

  checks.push(demoCheck(info, readmeRes.notFound ? "" : readmeRes.data || ""));

  return { repo: `${owner}/${repo}`, checks };
}

function demoCheck(info, readmeText) {
  if (info.homepage && info.homepage.trim()) {
    return row("demo", "Demo or live link present", "pass", `Homepage set: ${info.homepage.trim()}`);
  }
  const urls = readmeText.match(/https?:\/\/[^\s)>\]"']+/g) || [];
  const video = urls.find((u) => /(youtube\.com|youtu\.be|vimeo\.com)/i.test(u));
  if (video) {
    return row("demo", "Demo or live link present", "pass", `Demo video linked in README: ${video}`);
  }
  const live = urls.find((u) => {
    if (/(github\.com|githubusercontent\.com|img\.shields\.io|shields\.io)/i.test(u)) return false;
    if (/\.(png|jpe?g|gif|svg|webp)(\?|$)/i.test(u)) return false;
    return true;
  });
  if (live) {
    return row("demo", "Demo or live link present", "pass", `Live link in README: ${live}`);
  }
  return row(
    "demo",
    "Demo or live link present",
    "fix",
    "No homepage set and no demo or live link in the README. Reviewers need a link they can open."
  );
}

function sendJson(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { "content-type": "application/json" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  try {
    if (url.pathname === "/") {
      const html = await readFile(join(root, "public", "index.html"), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }
    if (url.pathname === "/api/check") {
      const parsed = parseRepo(url.searchParams.get("repo") || "");
      if (!parsed) {
        sendJson(res, 400, { error: "That does not look like a GitHub repo URL." });
        return;
      }
      const result = await runChecks(parsed.owner, parsed.repo);
      sendJson(res, 200, result);
      return;
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("Not found");
  } catch (err) {
    sendJson(res, 502, {
      error: "GitHub could not be reached. Try again shortly.",
      detail: String(err && err.message ? err.message : err),
    });
  }
});

server.listen(PORT, () => {
  console.log(`ShipCheck listening on http://localhost:${PORT}/`);
});
