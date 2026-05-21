# Security Audit Report
Date: 2026-05-21 (UTC)

## Scope
- Static review of repository source files (excluding vendored third-party assets under `vendor/`).
- Dependency vulnerability check via `npm audit`.

## Commands Executed
1. `npm audit --json`
2. `rg -n "(eval\(|new Function\(|innerHTML\s*=|document\.write\(|child_process|exec\(|spawn\()" --glob '!vendor/**'`

## Findings

### 1) Dependency vulnerability scan blocked (environment/registry restriction)
- `npm audit` returned `403 Forbidden` from the npm advisories endpoint.
- Result: unable to confirm third-party dependency CVEs from npm advisories in this environment.
- Risk impact: **Unknown** for dependencies until audit can be completed.

### 2) Multiple dynamic HTML sinks (`innerHTML`) in app code
- Several files render dynamic content into `innerHTML`.
- Some locations already appear to use escaping helpers (e.g. `escapeHtml(...)`), but not all usages are trivially provable safe from grep-only inspection.
- Risk impact: **Medium**, depending on whether all user-controlled values are consistently sanitized before insertion.

Representative files with `innerHTML` writes:
- `category`
- `dashboard`
- `post`
- `partials/topbar.client.js`
- `profile`
- others listed by grep output.

## Recommendations
1. Re-run dependency audit from an environment with npm advisory access:
   - `npm audit --production`
   - optionally add `npm audit --omit=dev --json` in CI.
2. Reduce `innerHTML` usage where possible:
   - prefer `textContent`, `createElement`, and explicit DOM node assembly.
3. Where HTML insertion is required:
   - enforce a single sanitizer policy (e.g. trusted template + escaping helper) and add tests for XSS payloads.
4. Add a baseline security lint stage in CI:
   - Semgrep/ESLint rules for DOM XSS sinks, dangerous eval, and command execution patterns.

## Current Conclusion
- No direct `eval(...)` / `new Function(...)` / `document.write(...)` findings in first-pass grep.
- Potential DOM-XSS exposure surface exists via multiple `innerHTML` assignments and should be reviewed per sink.
- Dependency CVE status remains unverified due to audit endpoint access failure.
