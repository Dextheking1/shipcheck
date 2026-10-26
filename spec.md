---
doc: spec
status: approved
---

# ShipCheck — Technical Spec

## How This Works, In Plain Language
ShipCheck is one small program with no moving parts beyond itself. It serves a single web page. When someone pastes a repo URL and presses Check, the page sends the URL to the program's own check endpoint. The program asks GitHub's public API three questions about that repo (does it exist and is it public, what files sit at its root, what does its README say), works out the five verdicts, and sends them back. The page then asks for the fix-first summary, which the program generates with a free text service, or writes from a fixed rule if that service does not answer. Nothing is saved anywhere. Close the tab and it is gone.

Why this shape: the checks are the product. A single file of server code plus one page proves them with the fewest things that can break on demo day.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. User opens `/` → the Server hands back the Page. → they see the input and the five checks listed.
2. User pastes a URL and presses Check → the Page parses nothing itself; it sends the raw text to `GET /api/check`. → the Server parses the repo owner and name out of the text.
3. The Server calls the GitHub API for the repo, its root listing, and its README → turns the answers into five verdicts. → the Page renders one row per verdict.
4. The Page sends the verdicts to `GET /api/summary` → the Server asks the summary service for two or three sentences, or applies the fallback rule. → the summary appears under the list.

## Stack
- Node.js 22 or newer, built-in `http` module and global `fetch` only. Zero npm dependencies, so `npm install` is never a failure mode.
  Docs: https://nodejs.org/api/http.html
- One HTML page with inline CSS and JavaScript. No framework, no build step.
- GitHub REST API, unauthenticated, for repo data.
  Docs: https://docs.github.com/en/rest
- Pollinations text API for the summary, free, no key.
  Docs: https://text.pollinations.ai/

Tradeoff accepted: unauthenticated GitHub API allows 60 requests per hour per IP, and one check uses 3. Fine for a demo and real deadline use; it would not survive a crowd, and the POC does not need it to.

## Where It Runs and How Someone Tries It
Runs anywhere Node 22+ runs, as a local process. No keys, no environment variables required.

Start: `node server.js` (listens on port 8730, or `PORT` if set).
Open: http://localhost:8730/

That is also exactly how the demo video is recorded: start it, open the page, run the two test repos. Deployment is optional and not part of this POC; the submission uses the video and the public repo.

## Look and Feel
Carried from `prd.md > Look and Feel`: white page, black text, system font stack, green PASS and red FIX labels, one column, no cards or gradients. The stack honors this fully with plain CSS; nothing in the stack fights it.

## Components

### The Page (`public/index.html`)
The whole interface: heading, one-line description, URL input, Check button, results area, summary area, and the static "what gets checked" list. On submit it calls the Check API, renders rows, then calls the Summary API and fills the summary block. Handles the bad-input and error lines from `prd.md > States and Boundaries`.
PRD ref: `prd.md > Screens and Layout`, `prd.md > States and Boundaries`.

### The Check API (`server.js`, route `GET /api/check?repo=...`)
Parses the pasted text into owner/repo (accepts full URLs and bare owner/repo), calls GitHub, returns the five verdicts as JSON. A 404 from GitHub short-circuits: first verdict FIX, the rest marked not run. Other GitHub failures return a single error the Page shows plainly.
PRD ref: `prd.md > Features and Behavior` (Running a check).

### The Summary (`server.js`, route `GET /api/summary`)
Takes the verdict list, formats a short prompt naming the failures, calls the Pollinations text API with a short timeout, returns its text. On any failure or timeout, returns the fallback: the first failed check in order, named as the first fix, with its detail.
PRD ref: `prd.md > Features and Behavior` (The fix-first summary).

## Data Model
No storage. The only data shape is the check result, which lives in memory between the two calls:

```
{ repo: "owner/name",
  checks: [ { id: "public"|"license"|"readme"|"docs"|"demo",
              label: string, status: "pass"|"fix"|"skip", detail: string } ] }
```

The Page holds it in a variable; a new run replaces it. Nothing persists between sessions, per `scope.md > Explicitly Cut`.

## File Structure

```
shipcheck/
├── server.js            # the whole server: page hosting, check API, summary
├── public/
│   └── index.html       # the one page, inline CSS and JS
├── package.json         # name, start script, no dependencies
├── README.md            # what it is, how to run it
├── LICENSE              # MIT
├── scope.md             # copy of devpost/scope.md, at root for the event checker
├── prd.md               # copy of devpost/prd.md
├── spec.md              # copy of devpost/spec.md
├── .gitignore
├── .agents/skills/      # the installed Devpost Learn Skill Pack
└── devpost/             # Devpost learning workspace
    ├── scope.md
    ├── prd.md
    ├── spec.md
    ├── checklist.md
    ├── app-map.html
    └── learner-profile.md   # gitignored, never committed
```

## External Services and Dependencies
- **GitHub REST API** — `GET /repos/{owner}/{repo}` (existence, public flag, license object, homepage), `GET /repos/{owner}/{repo}/contents/` (root listing for README and the three docs), `GET /repos/{owner}/{repo}/readme` with raw accept header (README text for the demo-link check). No key. Limit: 60 requests/hour per IP unauthenticated.
  Docs: https://docs.github.com/en/rest/repos/repos, https://docs.github.com/en/rest/repos/contents
- **Pollinations text API** — `GET https://text.pollinations.ai/{url-encoded prompt}` returns plain text. No key, free. Treated as unreliable by design: 8 second timeout, fallback behind it.
  Docs: https://text.pollinations.ai/

## Important Failure Modes
- **GitHub rate limit or outage** → the check endpoint returns an error, the Page shows "GitHub could not be reached. Try again shortly." No partial results.
- **Summary service slow or down** → the fallback summary appears; the list is never blocked on it.
- **Repo private or missing** → GitHub's 404 becomes the first row FIX and the remaining rows "not run", per the PRD, instead of five misleading failures.

## What Was Simplified and Why
- **Zero-dependency Node server** instead of a framework app — the page and two endpoints do not need one, and every dependency is a thing that can break before a deadline.
- **Docs checked at root or in devpost/** instead of anywhere in the tree — one extra API call per folder level would burn the rate limit; root and devpost/ are where this event's workflow puts them.
- **Demo link detected by homepage field or README links** instead of fetching and verifying the link target — verifying targets is the deferred product from the PRD.

## Decisions and Open Issues
- Chosen: server-side GitHub calls (in `server.js`) over browser-direct calls. Reason: one place handles the 404 and rate-limit shapes, and the page stays dumb. Tradeoff: the app needs the Node process running; accepted, the start command is one line.
- Chosen: Pollinations for the summary. Reason: free, no key, plain text back. Tradeoff: quality and uptime vary, which is why the fallback rule exists and the list never waits for it.
- Genuine uncertainty, raised by the builder: whether the Pollinations response stays short and on-topic when handed a list of failures, or rambles. Investigation agreed for the build: run it once against the DepVet result (three missing docs) and read the raw output; if it rambles, tighten the prompt with an explicit two-sentence limit before shipping.
- Nothing else unresolved. No open questions carried from `prd.md > Open Questions`.
