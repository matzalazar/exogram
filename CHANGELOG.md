# Changelog

All notable changes to this project will be documented in this file.

---

## [0.1.2] — 2026-05-19

### added
- **dark mode**: a sun/moon toggle now appears on all pages — landing, philosophy, changelog, login, forgot password, and the authenticated navbar. theme preference is saved in `localStorage` and respects the system's `prefers-color-scheme` on first visit. contributed by [@imanubdesigner](https://github.com/imanubdesigner).

---

## [infra] — 2026-04-23

### deploy pipeline hardening

- **concurrency control**: added `concurrency: group: deploy-main, cancel-in-progress: true`. If a manual `workflow_dispatch` triggers while an automatic deploy is running (or vice versa), the previous one is cancelled. Previously, two simultaneous deploys could run on the same server.
- **job timeout**: the `deploy` job now has `timeout-minutes: 20`. If any step (rsync, SSH, build) hangs, the workflow fails after 20 minutes instead of running until GitHub's 6h limit.
- **`--remove-orphans` in compose up**: if a service is removed from `docker-compose`, the old container no longer remains running on the server.
- **health check with retries**: the final `http://127.0.0.1:8000/api/health/` check now retries up to 30 times with 2s intervals (60s total) before declaring the deploy failed. This avoids false negatives when the backend takes a few seconds to start post-migration.
- **dependabot for GitHub Actions**: added the `github-actions` ecosystem to `dependabot.yml` to keep actions (`checkout`, `setup-node`, etc.) updated weekly.

---

## [0.1.1] — 2026-03-29

### added
- **display preferences**: users can now adjust font size and content width from profile settings. changes apply instantly and persist per account.

---

## [0.1.0] — 2026-03-22

initial release of the exogram platform.

### added
- **foundation**: core architecture built.
- **closed system**: access strictly via waitlist or an invite-tree system.
- **personal library**: book import and management, with highlight and note curation.
- **zen interaction**: private in-network messaging threads and metric-free comments.
