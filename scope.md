---
doc: scope
status: approved
---

# ShipCheck

One line: paste a public GitHub repo URL, get a pass/fix list for your hackathon submission.

## The Unique Kernel
It checks a repo against what hackathon submission announcements actually demand, not generic repo health. License in place, README in place, the planning docs the event requires, a demo or live link a reviewer can open. One screen, one verdict per item, and a short "fix this first" summary at the end.

## Who It's For
A solo builder an hour before a hackathon deadline, repo ready, submission form open in the next tab. Today that person re-reads the announcement three times and still misses a required file. ShipCheck reads it once, against the repo, and shows what is missing.

## The Core Loop
Paste a repo URL, press check, read the list. Fix the top item, run it again. The loop repeats until every line passes, then they go submit.

## Inspiration & Identity
Born from a real afternoon: three hackathon events, three different submission checklists, and one project (DepVet) that turned out not to fit an event at all because of a build-process rule buried in the fine print. The tool should feel like a pre-flight checklist: plain, fast, no decoration getting in the way of the verdicts.

## Why This Matters to the Learner
He submits to hackathons constantly and the failure mode is never the code. It is a missing license file, a missing doc, a demo link nobody can open. A checker he trusts removes that whole class of last-minute loss.

## What "Working" Looks Like
You open one page, paste https://github.com/Dextheking1/depvet, and get back a list where license, README, and demo link pass, and the planning-docs line fails with the three missing filenames named. Then you paste the ShipCheck repo itself and watch the planning-docs line pass. That contrast is the demo.

## The POC Boundary
One page, one check run per paste, checks against the public GitHub API only. The five checks: repo public, license present, README present, planning docs present (scope.md, prd.md, spec.md), demo or live link present (repo homepage or a video/demo link in the README). One short generated summary of what to fix first, with a plain fallback if the summary call fails.

## Later
- Checks for other forges (GitLab, Bitbucket).
- Per-event rule sets (pick the hackathon, get its exact checklist).
- Checking the demo video link itself resolves and is public.

## Explicitly Cut
- Accounts and saved checks. Nothing to log into, nothing stored; a preflight tool you open once does not need your history.
- Private repo support. It would need tokens and auth; the submission problem is about public repos anyway.
- A scoring or grading system. Pass/fix is the whole language of a checklist; a number would be decoration.
