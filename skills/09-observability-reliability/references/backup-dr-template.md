# Backup & Disaster Recovery Template

## When to use
Reference this guide when designing a backup strategy, defining RTO/RPO targets, building disaster recovery runbooks, or preparing for your first annual DR drill.

## Decision framework

```
What backup strategy does this data need?
├── Is it user-generated or transactional data (orders, accounts, content)?
│   └── PITR (point-in-time recovery) + daily snapshots + off-site replication
│
├── Is it application state (sessions, cache, queues)?
│   └── Daily snapshots only — rebuild from source if lost
│
├── Is it uploaded media (images, videos, documents)?
│   └── Object storage with versioning + cross-region replication
│
├── Is it configuration or infrastructure-as-code?
│   └── Git is your backup — ensure CI/CD can redeploy from scratch
│
└── Is it logs or analytics data?
    └── Retain in logging service (30-90 days), archive to cold storage
```

---

## RTO / RPO definitions by tier

| Tier | Description | RTO (Recovery Time) | RPO (Recovery Point) | Example |
|------|-------------|---------------------|----------------------|---------|
| **P0** | Critical — total outage | 15 minutes | 5 minutes | Primary database, auth service |
| **P1** | Major — key feature down | 1 hour | 15 minutes | Payment processing, search index |
| **P2** | Minor — degraded experience | 4 hours | 1 hour | Email delivery, analytics pipeline |
| **P3** | Low — non-user-facing | 24 hours | 24 hours | Internal tools, batch reports |

> **RTO** = Maximum acceptable downtime before service is restored.
> **RPO** = Maximum acceptable data loss measured in time (e.g., RPO 5 min = you can lose at most 5 minutes of data).

---

## Copy-paste template

### PostgreSQL automated backup script

```bash
#!/usr/bin/env bash
# backup/pg-backup.sh
# [CUSTOMIZE] Set these variables for your environment

set -euo pipefail

# --- Configuration ---
DB_HOST="localhost"                          # [CUSTOMIZE] database host
DB_PORT="5432"                               # [CUSTOMIZE] database port
DB_NAME="myapp_production"                   # [CUSTOMIZE] database name
DB_USER="backup_user"                        # [CUSTOMIZE] database user (read-only recommended)
BACKUP_DIR="/var/backups/postgresql"          # [CUSTOMIZE] local backup directory
S3_BUCKET="s3://myapp-backups/postgresql"     # [CUSTOMIZE] S3 bucket path
RETENTION_DAYS=30                            # [CUSTOMIZE] local retention period
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# --- Ensure backup directory exists ---
mkdir -p "${BACKUP_DIR}"

# --- Create compressed backup ---
echo "[$(date)] Starting backup of ${DB_NAME}..."
PGPASSWORD="${PGPASSWORD:-}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --verbose \
  2>>"${BACKUP_DIR}/backup.log" \
  > "${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "[$(date)] Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

# --- Upload to S3 ---
echo "[$(date)] Uploading to ${S3_BUCKET}..."
aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${DB_NAME}_${TIMESTAMP}.sql.gz" \
  --storage-class STANDARD_IA \
  --sse aws:encryption                       # [CUSTOMIZE] encryption method
echo "[$(date)] Upload complete."

# --- Clean up old local backups ---
echo "[$(date)] Removing local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete

# --- Verify backup integrity ---
echo "[$(date)] Verifying backup integrity..."
pg_restore --list "${BACKUP_FILE}" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "[$(date)] Backup verification: PASSED"
else
  echo "[$(date)] Backup verification: FAILED — alert team immediately"
  # [CUSTOMIZE] Send alert via your preferred channel
  # curl -X POST "${SLACK_WEBHOOK}" -d '{"text":"BACKUP VERIFICATION FAILED for '"${DB_NAME}"'"}'
  exit 1
fi

echo "[$(date)] Backup pipeline complete."
```

### Cron schedule for automated backups

```cron
# [CUSTOMIZE] Add to crontab: crontab -e

# Daily full backup at 2:00 AM UTC
0 2 * * * /opt/scripts/backup/pg-backup.sh >> /var/log/pg-backup.log 2>&1

# WAL archiving for PITR (if using pg_basebackup / WAL-G)
# [CUSTOMIZE] Configure postgresql.conf:
#   archive_mode = on
#   archive_command = 'wal-g wal-push %p'
#   archive_timeout = 60
```

### AWS S3 lifecycle policy for backup tiering

```json
{
  "Rules": [
    {
      "ID": "BackupLifecycle",
      "Status": "Enabled",
      "Filter": { "Prefix": "postgresql/" },
      "Transitions": [
        {
          "Days": 30,
          "StorageClass": "GLACIER"
        },
        {
          "Days": 365,
          "StorageClass": "DEEP_ARCHIVE"
        }
      ],
      "Expiration": {
        "Days": 730
      }
    }
  ]
}
```

### Restore verification script

```bash
#!/usr/bin/env bash
# backup/verify-restore.sh
# Run monthly to validate backups are actually restorable
# [CUSTOMIZE] Set variables for your environment

set -euo pipefail

RESTORE_DB="restore_verification_temp"       # [CUSTOMIZE] temp DB name for verification
DB_HOST="localhost"                          # [CUSTOMIZE] use a non-production host
DB_PORT="5432"                               # [CUSTOMIZE]
DB_USER="backup_user"                        # [CUSTOMIZE]
S3_BUCKET="s3://myapp-backups/postgresql"     # [CUSTOMIZE]
BACKUP_DIR="/tmp/restore-verify"

mkdir -p "${BACKUP_DIR}"

# --- Fetch latest backup from S3 ---
LATEST_BACKUP=$(aws s3 ls "${S3_BUCKET}/" --recursive | sort | tail -1 | awk '{print $4}')
echo "[$(date)] Downloading latest backup: ${LATEST_BACKUP}"
aws s3 cp "${S3_BUCKET}/${LATEST_BACKUP}" "${BACKUP_DIR}/latest.sql.gz"

# --- Create temp database and restore ---
echo "[$(date)] Creating temporary database: ${RESTORE_DB}"
PGPASSWORD="${PGPASSWORD:-}" dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  --if-exists "${RESTORE_DB}"
PGPASSWORD="${PGPASSWORD:-}" createdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  "${RESTORE_DB}"

echo "[$(date)] Restoring backup..."
PGPASSWORD="${PGPASSWORD:-}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${RESTORE_DB}" \
  --no-owner \
  --no-privileges \
  --verbose \
  "${BACKUP_DIR}/latest.sql.gz" 2>&1 | tail -5

# --- Validate restored data ---
echo "[$(date)] Running validation queries..."
USERS_COUNT=$(PGPASSWORD="${PGPASSWORD:-}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
  -U "${DB_USER}" -d "${RESTORE_DB}" -t -c "SELECT COUNT(*) FROM users;")  # [CUSTOMIZE] table name

if [ "${USERS_COUNT// /}" -gt 0 ]; then
  echo "[$(date)] Restore verification: PASSED (${USERS_COUNT// /} users found)"
else
  echo "[$(date)] Restore verification: FAILED — restored DB appears empty"
  # [CUSTOMIZE] Send alert
  exit 1
fi

# --- Cleanup ---
echo "[$(date)] Dropping temporary database..."
PGPASSWORD="${PGPASSWORD:-}" dropdb -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" \
  "${RESTORE_DB}"
rm -rf "${BACKUP_DIR}"

echo "[$(date)] Monthly restore verification complete."
```

---

## Disaster recovery plan template

### DR runbook

```markdown
# Disaster Recovery Runbook
# [CUSTOMIZE] Fill in your specific infrastructure details

## 1. Declaration
- [ ] Incident Commander identified
- [ ] Severity assessed (see RTO/RPO table above)
- [ ] DR declared in #incident channel: "@here DR in progress — [brief description]"

## 2. Assessment (first 5 minutes)
- [ ] Identify affected systems (database / app servers / CDN / DNS)
- [ ] Determine data loss window (last known good backup time)
- [ ] Confirm backup availability in S3/GCS
- [ ] Decide failover strategy:
      - Option A: Restore to same region from backup
      - Option B: Failover to standby replica
      - Option C: Rebuild in alternate region

## 3. Failover procedure

### Database failover
- [ ] Promote read replica to primary:
      `aws rds promote-read-replica --db-instance-identifier [CUSTOMIZE]-replica`
- [ ] Update connection string in environment/secrets:
      `[CUSTOMIZE] Update DATABASE_URL in your secrets manager`
- [ ] Verify application connects to new primary
- [ ] Confirm write operations succeed

### Application failover
- [ ] Update DNS to point to DR region:
      `[CUSTOMIZE] Update Route53 / Cloudflare DNS records`
- [ ] Verify health endpoints return healthy:
      `curl https://[CUSTOMIZE-your-domain]/api/health/ready`
- [ ] Monitor error rates for 15 minutes

### Full restore from backup
- [ ] Download latest backup: `aws s3 cp s3://[CUSTOMIZE]/latest.sql.gz .`
- [ ] Restore to new instance (see restore script above)
- [ ] Verify row counts match expected ranges
- [ ] Re-point application to restored database

## 4. Validation
- [ ] All health checks passing
- [ ] Key user flows tested manually (sign up, core action, payment)
- [ ] Error rate returned to baseline
- [ ] Monitoring and alerting active on new infrastructure

## 5. Communication
- [ ] Internal status update sent (see incident-response-template.md)
- [ ] External status page updated if customer-facing
- [ ] Estimated time to full recovery communicated

## 6. Post-recovery
- [ ] Original infrastructure assessed for root cause
- [ ] Data reconciliation performed (check for gaps between RPO and recovery point)
- [ ] Post-mortem scheduled within 48 hours
- [ ] DR runbook updated with lessons learned
```

### Annual DR drill template

```markdown
# Annual DR Drill — [CUSTOMIZE: Date]
# Schedule: [CUSTOMIZE] Quarterly or annually, during low-traffic window

## Pre-drill checklist
- [ ] DR drill scheduled and communicated to team (2 weeks notice)
- [ ] Non-production environment prepared for drill
- [ ] Backup availability confirmed
- [ ] Rollback plan documented in case drill causes issues
- [ ] Stakeholders notified (support team, on-call, management)

## Drill scenario
**Simulated failure**: [CUSTOMIZE] e.g., "Primary database in us-east-1 becomes unavailable"
**Expected RTO**: [CUSTOMIZE] e.g., 15 minutes
**Expected RPO**: [CUSTOMIZE] e.g., 5 minutes

## Execution log

| Step | Action | Expected Time | Actual Time | Status | Notes |
|------|--------|--------------|-------------|--------|-------|
| 1 | Declare DR drill | 0:00 | | | |
| 2 | Identify latest backup | 0:02 | | | |
| 3 | Begin restore / failover | 0:05 | | | |
| 4 | Application reconnected | 0:10 | | | |
| 5 | Health checks passing | 0:12 | | | |
| 6 | Key flows validated | 0:15 | | | |
| 7 | DR drill complete | 0:20 | | | |

## Post-drill review
- **Actual RTO achieved**: ___
- **Actual RPO achieved**: ___
- **Met target?**: Yes / No
- **Blockers encountered**: ___
- **Runbook gaps found**: ___
- **Action items**:
  - [ ] [CUSTOMIZE] items discovered during drill
```

---

## Customization notes

- **Solo founder / hobby project**: Start with automated daily `pg_dump` to S3. Skip PITR and cross-region replication until you have paying users. Run restore verification quarterly.
- **Growing startup (100-1K users)**: Enable PITR via WAL archiving. Set up S3 lifecycle policies for cost management. Run restore verification monthly. Document a basic DR runbook.
- **Scale (1K+ users)**: Add cross-region read replicas as warm standby. Implement automated failover (RDS Multi-AZ or equivalent). Run DR drills quarterly. Maintain RTO/RPO SLAs.
- **Compliance (SOC 2 / HIPAA)**: Document backup encryption at rest and in transit. Log all backup access. Maintain evidence of monthly restore tests and annual DR drills. Encrypt backups with customer-managed keys.

## Companion tools

- `phrazzld/claude-config` -> `/check-backups` — Validate backup configuration
- AWS CLI `aws rds describe-db-snapshots` — List RDS automated snapshots
- `wal-g` — PostgreSQL WAL archiver for continuous PITR backups
- `restic` — Encrypted, deduplicated backups for file-based data
