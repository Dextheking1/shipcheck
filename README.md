# ShipCheck

Paste a public GitHub repo URL, get a pass/fix list for your hackathon submission.

It checks the things submission announcements demand:

- Repo is public
- License present
- README present
- Planning docs present (scope.md, prd.md, spec.md, at the root or in `devpost/`)
- Demo or live link present (repo homepage, or a video/live link in the README)

Then it writes one short summary of what to fix first. No accounts, nothing stored.

## Run it

Needs Node 22 or newer. No dependencies.

```
node server.js
```

Open http://localhost:8730/

## How it was built

Built for Devpost's Build With AI: Basics with the Devpost Learn Skill Pack, stages in order: start, scope, PRD, spec, build, ship. The planning docs the skills generated are in `devpost/` (and copied to the repo root): `scope.md`, `prd.md`, `spec.md`, plus the build checklist.

## License

MIT. See `LICENSE`.
