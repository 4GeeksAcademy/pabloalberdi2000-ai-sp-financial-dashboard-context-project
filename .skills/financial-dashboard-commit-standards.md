# Skill: Financial Dashboard Commit Standards & QA Gate

**Scope:** Internal skill for ensuring commit quality, semantic versioning, and QA verification before merging into main.

**Objective:** Establish a consistent, auditable workflow for feature commits to the financial dashboard repository. Developers must follow atomic commit patterns, describe technical changes clearly, and verify build/test status before creating pull requests.

---

## Inputs

### Required Context
- **Changed Files:** List of files modified in the commit (provided via `git diff --name-only`)
- **Commit Message:** Proposed commit message (should follow conventional commits)
- **Build Status:** Result of `npm run build` (passed/failed)
- **Test Status:** Result of test suite (passed/failed/skipped)
- **Branch:** Current git branch name (must start with `feature/` or `fix/` for feature work)

### Optional Context
- **Co-authors:** GitHub usernames of contributors (for `Co-authored-by` trailer)
- **Issue Reference:** GitHub issue number (format: `#123`)
- **Migration Notes:** Breaking changes or database migrations (if any)

---

## Outputs

### Approval Checklist (Required)

```markdown
## ✅ Commit Quality Checklist

### 1. Atomic Scope
- [ ] Commit changes are logically grouped (single feature or fix, not mixed concerns)
- [ ] No unrelated files mixed (e.g., deps, CI config, unrelated refactors)
- [ ] File count ≤ 10 (adjust per complexity; large refactors split into multiple commits)

### 2. Message Quality
- [ ] Follows conventional commits format: `type(scope): description`
  - Valid types: `feat`, `fix`, `accessibility`, `perf`, `refactor`, `chore`, `docs`, `test`
  - Valid scopes: `frontend`, `backend`, `api`, `ui`, `accessibility`, `vercel`, or specific component
  - Description is imperative mood and lowercase
- [ ] Includes `Co-authored-by: ...` trailer if multiple authors
- [ ] No imperative subject duplicated in body
- [ ] Body (if present) explains "why" not "what"

### 3. Build & Test Verification
- [ ] `npm run build` passes without new errors or unjustified warnings
- [ ] All relevant test suites pass or are explicitly skipped with rationale
- [ ] TypeScript compilation (`npx tsc --noEmit`) succeeds
- [ ] No console errors or critical warnings introduced

### 4. Branch Hygiene
- [ ] Branch name follows pattern: `feature/kebab-case-name` or `fix/kebab-case-name`
- [ ] Branch is up-to-date with `origin/main`
- [ ] No unnecessary merge commits (rebase if needed)

### 5. Linkage & Documentation
- [ ] Commit references GitHub issue (if applicable)
- [ ] Specification or design doc linked (for new features)
- [ ] Breaking changes documented (with upgrade path, if any)
- [ ] New dependencies or config changes explained

### 6. Regression Prevention
- [ ] No hardcoded values/secrets in code
- [ ] No debug statements (`console.log`, `debugger`) left in
- [ ] No disabled tests or `.skip()` / `.only()` calls
- [ ] Previous test coverage maintained or improved

---

## Examples

### ✅ APPROVED: Well-Formed Commit

**Branch:** `feature/accessibility-aria-labels`

**Files Changed:**
```
frontend/src/App.tsx
frontend/src/components/dashboard/kpi-card.tsx
frontend/src/components/dashboard/dashboard-header.tsx
memory-bank/accessibility-audit.md
```

**Commit Message:**
```
accessibility: improve WCAG 2.1 Level AA compliance

- Add aria-busy and aria-label to loading states for screen reader announcements
- Add role='alert' and aria-live='polite' to error messages
- Add aria-hidden to decorative Lucide icons
- Add role='img' and aria-label to charts

Build verified: npm run build ✅ (no new warnings)
Tests verified: npm test ✅

Addresses GitHub issue #42 (Accessibility Audit)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

**Checklist Status:** ✅ APPROVED

---

### ❌ REJECTED: Problematic Commit

**Branch:** `main` (direct commit, no feature branch)

**Files Changed:**
```
frontend/src/App.tsx
frontend/src/components/dashboard/kpi-card.tsx
backend/app/main.py
backend/requirements.txt
docker-compose.yml
.github/workflows/ci.yml
memory-bank/productContext.md
memory-bank/systemStatus.md
frontend/package.json
```

**Commit Message:**
```
Various fixes and improvements
```

**Issues:**
- ❌ Committed directly to `main` (no feature branch)
- ❌ Mixed concerns: accessibility, backend routes, CI, dependencies, docs
- ❌ Vague commit message (no conventional format)
- ❌ No indication of build/test status
- ❌ 9 files changed without clear separation

**Checklist Status:** 🔴 REJECTED – Reformat as multiple atomic commits on feature branches.

---

## Acceptance Criteria

A commit is approved for PR/merge when:

1. ✅ All 6 checkpoints above are satisfied
2. ✅ At least one person (developer or reviewer) verifies the checklist
3. ✅ Build and test commands complete without new failures
4. ✅ Commit message is clear and future readers can understand intent
5. ✅ Branch follows naming convention
6. ✅ No unrelated files or concerns mixed in

---

## Common Mistakes & Corrections

| Mistake | Correction |
|---------|-----------|
| Commit to `main` directly | Create feature branch: `git checkout -b feature/my-feature` |
| `git add .` with node_modules | Use `.gitignore` and verify with `git status` before committing |
| Vague message: "Updates" | Use conventional commits: `feat(frontend): add date filter component` |
| Mixed concerns (UI + API + deps) | Separate into atomic commits: 1) UI changes, 2) API route, 3) dependencies |
| Forgot to build/test | Run `npm run build && npm test` before `git commit` |
| Hardcoded secrets | Use environment variables and `.env.example` |
| Disabled tests `.skip()` | Remove before committing unless rationale is in message |

---

## Related Procedures

- **Pre-Commit Hook:** Consider configuring `.husky/` with `lint-staged` to auto-verify before commit
- **CI/CD Validation:** GitHub Actions should re-verify build/test on PR
- **Code Review:** This checklist is part of PR review; merge conflicts and additional changes should be re-verified

---

## Usage

Before creating a PR or merging to main:

1. Run the checklist above against your commits
2. Verify each checkpoint is satisfied
3. If any fail, make corrections and amend the commit (or create new commits)
4. When all pass, create PR or merge confidently

**Goal:** Maintain a clean, auditable commit history that future developers and machines can easily parse and trust.

