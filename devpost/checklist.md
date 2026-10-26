---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast — the builder knows the stack and asked for outcomes fast; hands-on happens in one combined session at the final review.

## Slices

- [x] **1. Paste a repo URL and get the five verdicts**
  Becomes usable: The running app. You paste a public GitHub repo URL, press Check, and see the five rows with PASS or FIX and a detail line each.
  Why now: This is the kernel, end to end: page, check endpoint, GitHub API, verdicts. Everything else hangs off it, and the scaffold lives inside this slice.
  PRD ref: `prd.md > Features and Behavior` (Running a check), `prd.md > The Core Journey`
  Spec ref: `spec.md > Components` (The Page, The Check API), `spec.md > File Structure`
  Build: Write package.json, server.js with the static page route and GET /api/check (URL parsing, three GitHub calls, five verdicts), and public/index.html with the input, button, results rendering, and the static what-gets-checked list.
  Verify (mechanical): Start the server, run /api/check against Dextheking1/depvet and confirm license, README, demo pass and planning docs fail naming prd.md and spec.md; open the page and confirm it loads.
  Learner check: Covered in the combined final session for this tiny build.
  Commit: `Add page and repo checks`

- [x] **2. The fix-first summary appears under the list**
  Becomes usable: After the rows render, a short summary names the one fix to do first. If the summary service does not answer, the fallback rule names the first failed check instead.
  Why now: The kernel's second half, and it carries the spec's one open uncertainty (summary output quality), which gets checked here with a real failure list.
  PRD ref: `prd.md > Features and Behavior` (The fix-first summary)
  Spec ref: `spec.md > Components` (The Summary), `spec.md > Decisions and Open Issues`
  Build: Add GET /api/summary in server.js (prompt from verdicts, Pollinations call with an 8 second timeout, fallback), and the summary block in the page that fills in after the rows.
  Verify (mechanical): Run the summary against the DepVet verdicts and read the raw text for length and focus; run it again with the summary host unreachable (bad host override) and confirm the fallback text appears.
  Learner check: Covered in the combined final session.
  Commit: `Add fix-first summary with fallback`

- [x] **3. Bad input and missing repos fail plainly**
  Becomes usable: Every rough edge from the PRD states list behaves: bad URL text gets one plain error line, a private or missing repo fails the first row and marks the rest not run, a GitHub failure shows the plain try-again line.
  Why now: These are the states a reviewer will hit in the first minute of the demo if they are wrong, and they are cheap now that the happy path exists.
  PRD ref: `prd.md > States and Boundaries`
  Spec ref: `spec.md > Important Failure Modes`
  Build: Error paths in the check endpoint (parse failure, GitHub 404 short circuit, non-200 GitHub responses) and the matching single error line rendering in the page.
  Verify (mechanical): Run the endpoint against "not a url", a nonexistent repo, and the finished shipcheck repo; confirm the three behaviors and that shipcheck passes all five rows.
  Learner check: Covered in the combined final session.
  Commit: `Handle bad input and missing repos plainly`

## Hands-on Checkpoints

- [x] Early usable behavior explored — combined with the final review session (tiny build, three slices, one sitting)
- [x] Final kick-the-tires exploration and feedback completed

## Final Review

Final review ran in the same sitting (fast mode, builder delegated hands-on and approved building and shipping the entry). The finished app was exercised against the PRD fixture repo (Dextheking1/depvet), a nonexistent repo, bad input, and its own repo. One real defect found and fixed during review: a localhost link in a README counted as a live link; the checker now excludes localhost and 127.0.0.1, verified by the detail line changing from the localhost URL to the real homepage. Deviations and fixes are recorded under Revisions and in `test-evidence/`.

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused alternative for an experienced plan-first builder. Traced the one real uncertainty from `spec.md > Decisions and Open Issues` (will the free summary service stay short and on-topic?) to its evidence: the generated summary for the DepVet fixture named scope.md first in two sentences (`test-evidence/summary-depvet.json`), and the fallback fired correctly with the summary host pointed at a dead address (`test-evidence/summary-fallback.json`). Takeaway: specify the observable result first and keep a rule-based fallback behind any free external service.
Route and stops: Reference route in `devpost/app-map.html`: `public/index.html` submit handler → `server.js` `runChecks()` → `server.js` `makeSummary()` / `fallbackSummary()`.
Edit outcome: Kept. Localhost and 127.0.0.1 excluded from live-link detection in `server.js` (`demoCheck`), found in final review, re-verified against the shipcheck repo itself.
Reflection: Already covered. The builder's stated learning outcome was the skill workflow itself, practiced across stages 1 to 6 in this build.
Activity mode: Focused alternative, with the app running live.

## Revisions

- Root-level copies of scope.md, prd.md, and spec.md added next to the canonical `devpost/` versions — the event announcement asks for the three files in the public repository, and root copies make them findable both ways. Same content, generated by the skills.
- A live deployment was added in 6-ship (lab, https://shipcheck.benihacking.top) although the spec called deployment optional and out of the POC — the checker needs a real demo or live link to pass its own fifth check, and the live instance gives reviewers something to try.
- Localhost links no longer count as live links — the finished checker passed its own repo for the wrong reason (its README run instructions) until the detail line exposed it.
