---
doc: prd
status: approved
---

# ShipCheck — Product Requirements

One line: a one-page preflight checker that reads a public GitHub repo and reports whether it is ready to submit to a hackathon.
Source: `scope.md > The Unique Kernel`, `scope.md > The Core Loop`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. The builder opens the page and sees one input, one button, and a short line on what gets checked.
2. They paste a public GitHub repo URL and press Check.
3. The page shows a checking state while the repo is read.
4. A list appears: one row per check, each marked PASS or FIX, with a one-line detail (what was found, or what is missing, naming files where that helps).
5. Under the list, a short summary says what to fix first and why. If everything passes, the summary says the repo is clear to submit.
6. They fix something, paste again, and re-run. No state is kept between runs.

## Screens and Layout
One page, one surface. Top to bottom: the name ShipCheck, one line on what it does, the URL input and Check button side by side, the results list, the summary block. Below the results, a collapsed "what gets checked" list naming the five checks so a first-time visitor knows the rules before running. Nothing else on the page.

## Look and Feel
Plain and fast, like a checklist on a clipboard. System fonts, black text on white, green for PASS and red for FIX, no gradients, no cards, no animation beyond the checking state. Dense enough to scan in five seconds. Copy is short and blunt: verbs, no marketing lines.

## Features and Behavior

### Running a check
Source: `scope.md > The POC Boundary`.

The user pastes a GitHub repo URL in any common shape (full URL, with or without https, with a trailing slash, or owner/repo). Pressing Check or Enter runs the check. While it runs, the button is disabled and a "Checking…" line shows. Results replace whatever was there before.

The five checks, in this order:
1. **Repo is public** — the repo exists and is readable without a login.
2. **License** — GitHub reports a license for the repo.
3. **README** — a README file exists at the repo root.
4. **Planning docs** — scope.md, prd.md, and spec.md exist at the repo root or in a devpost/ folder. The detail line names any that are missing.
5. **Demo or live link** — the repo has a homepage set, or the README contains a link to a video host (YouTube, Vimeo) or a live site (a URL that is not the repo itself or a badge/image).

Each row shows PASS or FIX and a one-line detail, for example "LICENSE found (MIT)" or "Missing: prd.md, spec.md".

- As a solo builder near a deadline, I want to paste my repo URL and see every failed requirement named, so I can fix them in order.
  - [ ] A run against a repo missing prd.md and spec.md names both files on the planning-docs row.
  - [ ] A run against a complete repo shows PASS on all five rows.

### The fix-first summary
Source: `scope.md > The Unique Kernel`.

After the list, one short paragraph (two or three sentences) names the most important fix and why it matters most, in plain words. It is generated from the check results. If the generation call fails or is slow, the paragraph falls back to a fixed rule: the first failed check in list order is the one to fix first. The list itself never waits on the summary; the summary area shows "Writing summary…" and fills in, or the fallback appears.

- As a builder with four red rows, I want one clear "start here", so I do not have to rank the fixes myself.
  - [ ] With multiple failures, the summary names exactly one first fix.
  - [ ] With the summary service unreachable, a fallback summary still appears.

## States and Boundaries
- **First use** — the input is empty, the five checks are listed under "what gets checked", no results area.
- **Checking** — button disabled, "Checking…" shown, previous results cleared.
- **Bad input** — the text is not a GitHub repo URL: one plain error line, "That does not look like a GitHub repo URL." No results.
- **Repo not found or private** — GitHub answers 404: the first check fails as FIX with "Repo not found or not public", and the remaining checks show as not run rather than failed.
- **GitHub rate limit or outage** — a plain error line says GitHub could not be reached and to try again shortly. No partial fake results.
- **All pass** — five PASS rows and a summary that says the repo is clear to submit.

## Product Decisions
- Five fixed checks matching what submission announcements demand, not a configurable rule engine — the announcement is the spec, and configuration is scope creep for a one-afternoon tool.
- Pass/fix wording only, no score — from `scope.md > Explicitly Cut`.
- No accounts and nothing stored — from `scope.md > Explicitly Cut`.
- The repo URL shapes accepted include bare owner/repo, because that is what people actually paste from their address bar or notes.

## What We're Building
The one page, the URL parsing, the five checks against the public GitHub API, the results list, the generated fix-first summary with its fallback, and the states above.

## Deferred From the POC
- GitLab and Bitbucket checks — different APIs, and GitHub covers this event and most hackathons.
- Per-event rule sets — needs a rules database; the fixed five cover the common demands.
- Verifying the demo link itself loads — a link check is a second product hiding inside this one.

## Possible Later Enhancements
A bookmarklet version for the submission-form tab. A "copy as markdown" button so the fix list can go straight into a notes file.

## Non-Goals
- Judging code quality. ShipCheck never reads the code; it checks submission readiness only.
- Submitting anything anywhere. It reports; the builder submits.

## Open Questions
None that block `4-spec`. The summary service choice is a spec decision.
