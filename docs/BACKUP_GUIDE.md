# Backup Guide - Bloomwell AI Platform

This document outlines the backup procedures, automated workflows, and restoration processes for the Bloomwell AI codebase.

## Overview

The backup strategy includes:
- **Automated Daily Backups**: GitHub Actions workflow creates daily backup branches and archives
- **Manual Backup Tags**: Date-stamped tags for important milestones
- **Feature Branch Backups**: Dedicated backup branches for major features
- **Artifact Storage**: Compressed archives stored as GitHub Actions artifacts (30-day retention)

## Automated Backups

### Daily Backup Workflow

**Location**: `.github/workflows/daily-backup.yml`

**Schedule**: Runs daily at 2:00 AM UTC (configurable via cron)

**What It Does**:
1. Creates a backup branch named `backup/YYYY-MM-DD`
2. Validates database schema using Prisma
3. Creates a compressed archive of the codebase (excluding build artifacts)
4. Uploads archive as GitHub Actions artifact (30-day retention)

**Manual Trigger**: Can be triggered manually via GitHub Actions UI (workflow_dispatch)

**Artifact Access**:
- Navigate to: Repository → Actions → Daily Backup → Latest run → Artifacts
- Download the `codebase-backup-YYYYMMDD` artifact
- Extract the tarball to restore codebase state

### Backup Branch Naming

- Format: `backup/YYYY-MM-DD`
- Example: `backup/2025-11-20`
- Purpose: Daily snapshots of the codebase state

## Manual Backup Procedures

### Creating a Backup Tag

For important milestones or before major changes:

```bash
# Create annotated tag with current date
git tag -a backup-$(date +%Y%m%d) -m "Backup: [Description] - $(date +%Y-%m-%d)"

# Push tag to remote
git push origin backup-$(date +%Y%m%d)
```

**Tag Format**: `backup-YYYYMMDD`

**Example**:
```bash
git tag -a backup-20251120 -m "Backup: UI updates and webinar features - 2025-11-20"
git push origin backup-20251120
```

### Creating a Feature Backup Branch

For major feature work that needs isolation:

```bash
# Create backup branch from current commit
git checkout -b feature/[feature-name]-backup

# Push to remote
git push origin feature/[feature-name]-backup
```

**Example**:
```bash
git checkout -b feature/marketing-refactor-backup
git push origin feature/marketing-refactor-backup
```

## Pre-Commit Checklist

Before committing work for backup:

1. **Review Git Status**
   ```bash
   git status
   git diff --stat
   ```

2. **Verify Secrets Are Ignored**
   ```bash
   git check-ignore -v .env* apps/web/.env* packages/*/.env*
   ```
   Ensure all `.env` files are properly ignored

3. **Run Quality Checks** (if possible)
   ```bash
   npm run type-check
   npm run lint
   npm run test
   npm run build
   ```
   Note: Pre-existing errors may require `--no-verify` flag

4. **Stage Changes**
   ```bash
   git add [specific files or directories]
   # Or stage all changes
   git add .
   ```

5. **Create Descriptive Commit**
   ```bash
   git commit -m "feat: [Description of changes]

   - Detailed change 1
   - Detailed change 2
   - ...
   "
   ```

6. **Push to Remote**
   ```bash
   git push origin [branch-name]
   ```

## Restoration Procedures

### Restore from Backup Tag

```bash
# List available backup tags
git tag | grep backup

# Checkout specific backup tag
git checkout backup-YYYYMMDD

# Create new branch from backup (recommended)
git checkout -b restore-from-backup-YYYYMMDD backup-YYYYMMDD
```

### Restore from Backup Branch

```bash
# List backup branches
git branch -a | grep backup

# Checkout backup branch
git checkout backup/YYYY-MM-DD

# Or create new branch from backup
git checkout -b restore-from-backup backup/YYYY-MM-DD
```

### Restore from Artifact Archive

1. Download artifact from GitHub Actions
2. Extract tarball:
   ```bash
   tar -xzf codebase-backup-YYYYMMDD.tar.gz
   ```
3. Review extracted files
4. Copy necessary files back to working directory

### Restore Specific Files

```bash
# Restore file from specific commit
git checkout [commit-hash] -- [file-path]

# Restore file from backup tag
git checkout backup-YYYYMMDD -- [file-path]

# Restore file from backup branch
git checkout backup/YYYY-MM-DD -- [file-path]
```

## Backup Verification

### Verify Remote References

```bash
# Verify tags are pushed
git ls-remote --tags origin | grep backup

# Verify branches are pushed
git ls-remote --heads origin | grep backup

# Verify feature backup branches
git ls-remote --heads origin | grep feature.*backup
```

### Verify Commit History

```bash
# View recent commits
git log --oneline -10

# View commits on specific branch
git log origin/feature/[branch-name] --oneline -10

# View commits for specific tag
git log backup-YYYYMMDD --oneline -10
```

### Test Repository Clone

To verify backup integrity:

```bash
# Clone repository in temporary location
cd /tmp
git clone [repository-url] test-backup-verify
cd test-backup-verify

# Checkout backup tag/branch
git checkout backup-YYYYMMDD

# Verify build (if applicable)
npm install
npm run build
```

## Monitoring & Alerts

### GitHub Actions Notifications

1. **Enable Repository Notifications**:
   - Go to: Repository → Settings → Notifications
   - Enable notifications for workflow runs
   - Set up email/Slack notifications for failures

2. **Workflow Status Monitoring**:
   - Check: Repository → Actions → Daily Backup
   - Review latest run status
   - Investigate any failures immediately

### Backup Health Checks

**Weekly Review**:
- Verify daily backup branches are being created
- Check artifact retention (30 days)
- Review backup branch naming consistency

**Monthly Review**:
- Archive old backup tags if needed
- Review backup strategy effectiveness
- Update documentation as needed

## Backup Retention Policy

- **Daily Backup Branches**: Kept indefinitely (can be cleaned up manually)
- **Backup Tags**: Kept indefinitely (immutable references)
- **GitHub Actions Artifacts**: 30 days (automatic cleanup)
- **Feature Backup Branches**: Kept until feature is merged and verified

## Troubleshooting

### Backup Workflow Fails

1. Check GitHub Actions logs for error details
2. Verify repository permissions (contents: write)
3. Check if backup branch already exists (workflow handles this)
4. Verify Prisma schema validation passes

### Cannot Restore from Backup

1. Verify backup tag/branch exists on remote:
   ```bash
   git fetch --all --tags
   git ls-remote --tags origin | grep backup
   ```

2. Check if you have access to the repository
3. Verify the backup wasn't deleted (tags are usually immutable)

### Artifact Not Available

- Artifacts are automatically deleted after 30 days
- For long-term backup, use tags or branches instead
- Download artifacts before 30-day expiration if needed

## Best Practices

1. **Commit Frequently**: Don't wait to commit work
2. **Use Descriptive Messages**: Clear commit messages help identify backups
3. **Tag Major Milestones**: Create tags for releases and major features
4. **Verify Backups**: Periodically verify backup integrity
5. **Monitor Workflows**: Check that automated backups are running
6. **Document Changes**: Update this guide when backup procedures change

## Related Documentation

- [Deployment Guide](./DEPLOYMENT.md)
- [Environment Setup](../ENVIRONMENT_SETUP.md)
- [Onboarding Flow](./ONBOARDING_FLOW.md)

## Backup History

### Recent Backups

- **2025-11-20**: UI updates, settings improvements, and webinar features
  - Tag: `backup-20251120`
  - Branch: `feature/marketing-refactor-backup`
  - Commit: `6e8291c`

---

**Last Updated**: 2025-11-20  
**Maintained By**: Development Team

