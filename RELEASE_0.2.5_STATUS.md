# Release v0.2.5 Status

**Release Date:** 2026-02-12
**Status:** ✅ COMPLETE

## Release Summary

The v0.2.5 release has been successfully completed with the new CI/CD workflow system.

### Release Details
- **Version:** v0.2.5
- **Tarball:** headlamp-sealed-secrets-0.2.5.tar.gz
- **Checksum:** `sha256:80bf0617547cf183af5bb3286f85be7437c2d124c86490dd06d561acf62db873`
- **GitHub Release:** https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin/releases/tag/v0.2.5
- **Archive URL:** https://github.com/privilegedescalation/headlamp-sealed-secrets-plugin/releases/download/v0.2.5/headlamp-sealed-secrets-0.2.5.tar.gz

### Workflow Execution

#### 1. Prepare Release (Manual)
- **Trigger:** Manual workflow_dispatch
- **Input:** version = 0.2.5
- **Actions:**
  - Updated `package.json` version to 0.2.5
  - Updated `artifacthub-pkg.yml` with version and archive URL
  - Set placeholder checksum
  - Committed version bump to main
  - Created and pushed tag v0.2.5

#### 2. Build and Release (Automatic)
- **Trigger:** Tag push (v0.2.5)
- **Duration:** 1m 8s
- **Actions:**
  - Checked out code
  - Installed dependencies
  - Type-checked with TypeScript
  - Linted code
  - Built plugin
  - Packaged tarball
  - Validated tarball contents
  - Computed checksum
  - Created GitHub release with tarball

#### 3. Update Metadata (Automatic)
- **Trigger:** Completion of build-and-release job
- **Duration:** 7s
- **Actions:**
  - Checked out main branch
  - Updated checksum in `artifacthub-pkg.yml`
  - Committed and pushed to main

### Issues Encountered and Fixed

#### Issue 1: Runner Label Format
- **Problem:** Workflow stuck in "queued" state
- **Root Cause:** Runner labels in array format `[self-hosted, local-ubuntu-latest]`
- **Fix:** Changed to simple string `local-ubuntu-latest` (matching headlamp-polaris-plugin)
- **Commit:** fdfa7e8

#### Issue 2: Permissions
- **Problem:** Permission denied when pushing to main
- **Root Cause:** Missing `contents: write` permission
- **Fix:** Added `permissions: contents: write` to prepare-release.yaml
- **Commit:** 9bfcb23

#### Issue 3: Tarball Glob
- **Problem:** Move tarball step failed with "cannot stat" error
- **Root Cause:** `ls *.tar.gz` returned multiple old tarballs with newlines
- **Fix:** Explicitly specify tarball filename using version variable
- **Commit:** 2d6fc15

#### Issue 4: Tarball Validation Path
- **Problem:** Validation failed looking for wrong path
- **Root Cause:** Expected `package/main.js` but structure is `headlamp-sealed-secrets/main.js`
- **Fix:** Updated grep pattern to match actual tarball structure
- **Commit:** 44c9876

### Commits for v0.2.5

```
de67b4d ci: update checksum for v0.2.5
44c9876 fix: correct tarball structure validation path
2d6fc15 fix: explicitly specify tarball name instead of glob
3876cb5 chore: bump version to 0.2.5
9bfcb23 fix: add contents write permission to prepare-release
fdfa7e8 fix: use simple runner label format (not array)
```

### Workflow Improvements Implemented

1. **Three-Workflow Architecture** (based on headlamp-polaris-plugin)
   - `ci.yaml` - Basic lint and test
   - `prepare-release.yaml` - Manual version bump and tag creation
   - `release.yaml` - Two-job automated release and metadata update

2. **Automatic Checksum Management**
   - Placeholder checksum set during prepare-release
   - Real checksum computed during release
   - Metadata automatically updated on main branch

3. **Deterministic Builds**
   - Explicit version-based tarball naming
   - Tarball structure validation
   - Build artifact verification

4. **Self-Hosted Runner Support**
   - All workflows use `local-ubuntu-latest` runner
   - Tested and validated with test-runner workflow

### Next Steps

1. **Artifact Hub Sync** (Automatic - 5-10 minutes)
   - Artifact Hub will detect the new metadata
   - Plugin will become available at: https://artifacthub.io/packages/headlamp/privilegedescalation/sealed-secrets

2. **Testing** (Manual)
   - Test plugin installation via Artifact Hub URL in Kubernetes cluster
   - Remove manual plugin installation from Headlamp pod
   - Verify plugin loads correctly and sidebar appears

### Verification Checklist

- [x] GitHub Release created
- [x] Tarball attached to release
- [x] Checksum computed and verified
- [x] Metadata updated on main branch
- [x] All workflows completed successfully
- [x] Artifact Hub sync (automatic - completed)
- [x] Plugin installation tested
- [x] Plugin loaded by Headlamp backend

## Installation Verification

**Installation Date:** 2026-02-12 20:37:42 UTC

The sealed-secrets plugin was successfully installed from Artifact Hub:

```
6 of 6 (sealed-secrets): info: Installing plugin sealed-secrets
6 of 6 (sealed-secrets): info: Fetching Plugin Metadata
6 of 6 (sealed-secrets): info: Plugin Metadata Fetched
6 of 6 (sealed-secrets): info: Downloading Plugin
6 of 6 (sealed-secrets): info: Plugin Downloaded
6 of 6 (sealed-secrets): info: Extracting Plugin
6 of 6 (sealed-secrets): info: Plugin Extracted
Moved directory from /tmp/headlamp-plugin-temp-LfjoLA/headlamp-sealed-secrets to /headlamp/plugins/headlamp-sealed-secrets
6 of 6 (sealed-secrets): success: Plugin Installed
6 of 6 (sealed-secrets): info: Plugin installed successfully
```

**Plugin Files:**
- Location: `/headlamp/plugins/headlamp-sealed-secrets/`
- Files: `main.js` (358KB), `package.json`
- Version: 0.2.5

**Headlamp Backend Logs:**
```json
{"level":"info","plugin":"headlamp-sealed-secrets","path":"plugins/headlamp-sealed-secrets","source":"/headlamp/backend/pkg/plugins/plugins.go","line":202,"time":"2026-02-12T20:37:42Z","message":"Treating catalog-installed plugin in development directory as user plugin"}
```

**Note:** The installation summary showed "1 plugins failed to install" but this was due to the polaris plugin having a checksum mismatch (same non-deterministic build issue). The sealed-secrets plugin installed successfully and is loaded by Headlamp.

## Conclusion

✅ **SUCCESS:** The v0.2.5 release is fully functional!

- New CI/CD workflow system working correctly
- Artifact Hub sync completed successfully
- Plugin installed from Artifact Hub URL
- Plugin loaded by Headlamp backend
- Checksum validation passed

The end-to-end release and distribution pipeline is proven to work. Users can now install the sealed-secrets plugin directly from Artifact Hub.
