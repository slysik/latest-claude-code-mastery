# Plan: PIAM MySQL CDC to ClickHouse Pipeline

## Task Description
Add a MySQL + Debezium CDC pipeline to the PIAM dashboard demo that streams simulated PACS (Physical Access Control System) events through MySQL → Debezium → Redpanda → CDC Consumer → ClickHouse. This enables the existing dashboard to display "live" data without any frontend/UI changes.

## Objective
When this plan is complete:
- The existing backup-site dashboard will display real-time updating data from ClickHouse
- A complete CDC pipeline (MySQL → Debezium → Redpanda → Consumer → ClickHouse) will be operational
- `make demo-up` starts the entire stack with one command
- **Total memory footprint stays under 2.5GB** (safe for 8GB Mac with browser + IDE open)
- Demo works fully offline (no internet required)

## Problem Statement
The PIAM dashboard currently relies on batch-generated synthetic data or manual trickle scripts that insert directly to ClickHouse. For realistic demos, customers expect to see data flowing through a proper CDC pipeline that mirrors the CloudGate architecture: operational MySQL tables → Change Data Capture → analytics in ClickHouse.

## Solution Approach
1. **Extend docker-compose.yml** - Add MySQL, Redpanda (lightweight Kafka), and Debezium Connect to the existing compose file. Remove Superset (not needed for backup-site demos).
2. **Create MySQL operational schema** - Minimal `cg_access_event` and `cg_connector_health` tables that map to existing ClickHouse facts.
3. **New Python generator** - Writes simulated PACS events to MySQL at configurable rates.
4. **New Python CDC consumer** - Reads Debezium topics from Redpanda, maps rows, and inserts micro-batches to ClickHouse every 4 seconds.
5. **Dual mode support** - `INGEST_MODE=cdc` (full pipeline) or `INGEST_MODE=direct` (generator writes straight to ClickHouse as fallback).

## Hardcoded Demo Mode Guarantee

**CRITICAL: The existing hardcoded demo mode MUST continue working exactly as before.**

The backup-site has a Settings toggle (`useLiveData` state in `app/page.tsx`):
- **Toggle OFF (Demo Data)**: Uses hardcoded `fallbackData` in each hook - NO ClickHouse connection
- **Toggle ON (Live Data)**: Queries ClickHouse via `/api/clickhouse` endpoint

This plan only adds the **CDC pipeline that feeds ClickHouse**. The frontend toggle logic remains untouched:

```
┌─────────────────────────────────────────────────────────────────────┐
│  Frontend Toggle (unchanged)                                         │
│  ├── OFF: useLiveData=false → fallbackData (hardcoded) ✅ WORKS    │
│  └── ON:  useLiveData=true  → ClickHouse queries                    │
│                                    ↑                                 │
│                         [This plan feeds data here]                  │
│                                    │                                 │
│           MySQL → Debezium → Redpanda → Consumer → ClickHouse       │
└─────────────────────────────────────────────────────────────────────┘
```

**Verification**: After implementation, the demo MUST work in both modes:
1. **No Docker running** → Toggle OFF → Hardcoded data displays ✅
2. **Docker CDC stack running** → Toggle ON → Live updating data ✅

## Relevant Files
Use these files to complete the task:

**Existing Files (NO CHANGES to these)**:
- `backup-site/` - Next.js frontend (completely unchanged)
- `backup-site/app/page.tsx` - Main page with `useLiveData` toggle state (unchanged)
- `backup-site/components/SettingsPanel.tsx` - Toggle UI (unchanged)
- `backup-site/hooks/useClickHouse.ts` - Data hooks with `fallbackData` (unchanged)
- `clickhouse/init/01_schema.sql` - ClickHouse schema (facts, dims - unchanged)
- `clickhouse/init/02_rollups.sql` - Rollup tables (unchanged)
- `clickhouse/init/03_baselines.sql` - Baseline stats (unchanged)

**Files to Modify**:
- `docker-compose.yml` - Add MySQL, Redpanda, Debezium Connect; remove Superset
- `Makefile` - Add `demo-up`, `demo-down`, `demo-reset`, `demo-verify` targets

### New Files
- `ops/mysql-init/01_schema.sql` - MySQL operational schema (cg_* tables)
- `ops/mysql-init/02_grants.sql` - MySQL user grants for Debezium
- `ops/debezium/register-connector.sh` - Idempotent connector registration
- `ops/debezium/connector-config.json` - Debezium MySQL connector config
- `cdc-pipeline/generator.py` - Python script writing events to MySQL
- `cdc-pipeline/consumer.py` - Python script reading CDC topics → ClickHouse
- `cdc-pipeline/mapping.py` - MySQL row → ClickHouse row transformations
- `cdc-pipeline/config.py` - Shared configuration (env vars, defaults)
- `cdc-pipeline/requirements.txt` - Python dependencies
- `scripts/demo-verify.py` - Verification script for CDC pipeline health

## Implementation Phases

### Phase 1: Foundation
- Update `docker-compose.yml` with MySQL, Redpanda, Debezium Connect
- Remove Superset service (not needed)
- Create MySQL init scripts with operational schema
- Configure Debezium connector with low-memory settings

### Phase 2: Core Implementation
- Build Python generator that writes to MySQL with configurable event rates
- Build Python CDC consumer with micro-batch ClickHouse inserts
- Implement field mapping from `cg_*` tables to `piam.*` tables
- Add dual-mode support (CDC vs direct ingestion)

### Phase 3: Integration & Polish
- Create Makefile targets for one-command operations
- Build verification script that checks all pipeline stages
- Test memory footprint on 8GB Mac
- Document quickstart in README

## Team Orchestration

- You operate as the team lead and orchestrate the team to execute the plan.
- You're responsible for deploying the right team members with the right context to execute the plan.
- IMPORTANT: You NEVER operate directly on the codebase. You use `Task` and `Task*` tools to deploy team members to to the building, validating, testing, deploying, and other tasks.
  - This is critical. You're job is to act as a high level director of the team, not a builder.
  - You're role is to validate all work is going well and make sure the team is on track to complete the plan.
  - You'll orchestrate this by using the Task* Tools to manage coordination between the team members.
  - Communication is paramount. You'll use the Task* Tools to communicate with the team members and ensure they're on track to complete the plan.
- Take note of the session id of each team member. This is how you'll reference them.

### Team Members

- Builder
  - Name: builder-infra
  - Role: Docker Compose and infrastructure setup (MySQL, Redpanda, Debezium)
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-mysql
  - Role: MySQL schema and initialization scripts
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-generator
  - Role: Python generator that writes events to MySQL
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-consumer
  - Role: Python CDC consumer that reads topics and writes to ClickHouse
  - Agent Type: builder
  - Resume: true

- Builder
  - Name: builder-scripts
  - Role: Makefile targets and verification scripts
  - Agent Type: builder
  - Resume: true

- Validator
  - Name: validator-pipeline
  - Role: Validate entire CDC pipeline end-to-end
  - Agent Type: validator
  - Resume: false

## Step by Step Tasks

- IMPORTANT: Execute every step in order, top to bottom. Each task maps directly to a `TaskCreate` call.
- Before you start, run `TaskCreate` to create the initial task list that all team members can see and execute.

### 1. Update Docker Compose Infrastructure
- **Task ID**: update-docker-compose
- **Depends On**: none
- **Assigned To**: builder-infra
- **Agent Type**: builder
- **Parallel**: false
- Modify `/Users/slysik/Downloads/piam-dashboard/docker-compose.yml`:
  - Remove the `superset` service entirely
  - Remove `superset-data` volume
  - **Add explicit memory limits to ClickHouse**:
    - `mem_limit: 1g` (hard cap at 1GB)
    - `memswap_limit: 1g` (no swap)
  - Add `mysql` service:
    - Image: `mysql:8.0`
    - Port: 3306
    - **Memory limit: 256MB** (`mem_limit: 256m`)
    - Environment: `MYSQL_ROOT_PASSWORD=rootpass`, `MYSQL_DATABASE=cloudgate`
    - Performance tuning for low memory:
      ```
      command: --innodb-buffer-pool-size=64M --innodb-log-buffer-size=8M --max-connections=50
      ```
    - Volume mount for init scripts: `./ops/mysql-init:/docker-entrypoint-initdb.d:ro`
    - Healthcheck using `mysqladmin ping`
  - Add `redpanda` service:
    - Image: `redpandadata/redpanda:v24.1.1`
    - Ports: 9092 (Kafka API only - skip 8081/8082 to save memory)
    - **Memory limit: 256MB** (`mem_limit: 256m`)
    - Single broker, development mode
    - Command with `--memory 200M --reserve-memory 0M --smp 1 --overprovisioned`
  - Add `debezium-connect` service:
    - Image: `debezium/connect:2.5`
    - Port: 8083
    - **Memory limit: 400MB** (`mem_limit: 400m`)
    - JVM heap: `KAFKA_HEAP_OPTS=-Xms128m -Xmx256m`
    - Environment pointing to Redpanda as bootstrap server
    - Depends on: mysql, redpanda
  - Add `generator` service:
    - Build context: `./cdc-pipeline`
    - Command: `python generator.py`
    - **Memory limit: 64MB** (`mem_limit: 64m`)
    - Environment: `INGEST_MODE`, `MYSQL_HOST`, `CLICKHOUSE_HOST`
    - Depends on: mysql, clickhouse
  - Add `consumer` service:
    - Build context: `./cdc-pipeline`
    - Command: `python consumer.py`
    - **Memory limit: 64MB** (`mem_limit: 64m`)
    - Environment: `KAFKA_BOOTSTRAP`, `CLICKHOUSE_HOST`
    - Depends on: redpanda, clickhouse, debezium-connect
- Update network to include all services on `piam-network`

**Memory Budget Summary (8GB Mac safe):**
| Service | Limit | Can Lower? | Optimization Notes |
|---------|-------|------------|-------------------|
| ClickHouse | 1GB | ⚠️ 768MB risky | Aggregation queries need headroom |
| MySQL | 256MB | ⚠️ 192MB tight | 64MB buffer pool is already minimal |
| Redpanda | 256MB | ❌ No | 200MB internal is minimum for Kafka |
| Debezium | 400MB | ❌ No | JVM overhead + 256MB heap is minimum |
| Generator | 64MB | ✅ 48MB OK | Python + mysql-connector is light |
| Consumer | 64MB | ✅ 48MB OK | Python + kafka-python is light |
| **Total** | **~2.1GB** | | Leaves ~6GB for macOS + browser + IDE |

**Memory Limit Analysis:**
- Limits are already optimized for 8GB Mac
- ClickHouse 1GB is the safe minimum for demo query performance
- Redpanda/Debezium cannot be lowered without instability
- Python services could go to 48MB but 64MB provides safety margin
- **Recommendation: Keep current limits** - they balance performance and memory

### 2. Create MySQL Init Scripts
- **Task ID**: create-mysql-schema
- **Depends On**: none
- **Assigned To**: builder-mysql
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 1)
- Create directory `/Users/slysik/Downloads/piam-dashboard/ops/mysql-init/`
- Create `ops/mysql-init/01_schema.sql`:
  ```sql
  -- CloudGate operational tables (minimal schema for CDC demo)

  CREATE TABLE IF NOT EXISTS cg_access_event (
    event_id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    event_time DATETIME(3) NOT NULL,
    person_id VARCHAR(50),
    badge_id VARCHAR(50) NOT NULL,
    site_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    direction ENUM('IN', 'OUT') NOT NULL,
    result ENUM('GRANT', 'DENY') NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    deny_reason VARCHAR(255),
    deny_code VARCHAR(50),
    pacs_source ENUM('LENEL', 'CCURE', 'S2', 'GENETEC') NOT NULL,
    pacs_event_id VARCHAR(100) NOT NULL,
    raw_payload TEXT,
    suspicious_flag TINYINT DEFAULT 0,
    suspicious_reason VARCHAR(255),
    suspicious_score FLOAT DEFAULT 0,
    processed_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_tenant_time (tenant_id, event_time)
  ) ENGINE=InnoDB;

  CREATE TABLE IF NOT EXISTS cg_connector_health (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    connector_id VARCHAR(50) NOT NULL,
    connector_name VARCHAR(100) NOT NULL,
    pacs_type ENUM('LENEL', 'CCURE', 'S2', 'GENETEC') NOT NULL,
    pacs_version VARCHAR(50),
    check_time DATETIME(3) NOT NULL,
    status ENUM('OK', 'WARN', 'DOWN') NOT NULL,
    latency_ms INT UNSIGNED NOT NULL,
    events_per_minute FLOAT NOT NULL,
    error_count_1h INT UNSIGNED DEFAULT 0,
    last_event_time DATETIME(3),
    error_message VARCHAR(500),
    error_code VARCHAR(50),
    endpoint_url VARCHAR(255),
    last_successful_sync DATETIME(3),
    INDEX idx_tenant_connector_time (tenant_id, connector_id, check_time)
  ) ENGINE=InnoDB;
  ```
- Create `ops/mysql-init/02_grants.sql`:
  ```sql
  -- Grants for Debezium CDC user
  CREATE USER IF NOT EXISTS 'debezium'@'%' IDENTIFIED BY 'dbz';
  GRANT SELECT, RELOAD, SHOW DATABASES, REPLICATION SLAVE, REPLICATION CLIENT ON *.* TO 'debezium'@'%';
  GRANT ALL PRIVILEGES ON cloudgate.* TO 'debezium'@'%';
  FLUSH PRIVILEGES;
  ```

### 3. Create Debezium Connector Configuration
- **Task ID**: create-debezium-config
- **Depends On**: create-mysql-schema
- **Assigned To**: builder-mysql
- **Agent Type**: builder
- **Parallel**: false
- Create directory `/Users/slysik/Downloads/piam-dashboard/ops/debezium/`
- Create `ops/debezium/connector-config.json`:
  ```json
  {
    "name": "cloudgate-mysql-connector",
    "config": {
      "connector.class": "io.debezium.connector.mysql.MySqlConnector",
      "tasks.max": "1",
      "database.hostname": "mysql",
      "database.port": "3306",
      "database.user": "debezium",
      "database.password": "dbz",
      "database.server.id": "184054",
      "database.server.name": "cg",
      "database.include.list": "cloudgate",
      "table.include.list": "cloudgate.cg_access_event,cloudgate.cg_connector_health",
      "include.schema.changes": "false",
      "topic.prefix": "cg",
      "schema.history.internal.kafka.bootstrap.servers": "redpanda:9092",
      "schema.history.internal.kafka.topic": "schema-changes.cloudgate",
      "transforms": "unwrap",
      "transforms.unwrap.type": "io.debezium.transforms.ExtractNewRecordState",
      "transforms.unwrap.add.fields": "op,ts_ms",
      "transforms.unwrap.drop.tombstones": "true",
      "key.converter": "org.apache.kafka.connect.json.JsonConverter",
      "key.converter.schemas.enable": "false",
      "value.converter": "org.apache.kafka.connect.json.JsonConverter",
      "value.converter.schemas.enable": "false"
    }
  }
  ```
- Create `ops/debezium/register-connector.sh`:
  ```bash
  #!/bin/bash
  # Idempotent Debezium connector registration
  set -e

  CONNECT_HOST="${CONNECT_HOST:-localhost:8083}"
  CONFIG_FILE="${CONFIG_FILE:-/ops/debezium/connector-config.json}"

  echo "Waiting for Debezium Connect to be ready..."
  until curl -s "http://${CONNECT_HOST}/connectors" > /dev/null 2>&1; do
    sleep 2
  done

  CONNECTOR_NAME=$(jq -r '.name' "$CONFIG_FILE")

  # Check if connector exists
  if curl -s "http://${CONNECT_HOST}/connectors/${CONNECTOR_NAME}" | grep -q '"name"'; then
    echo "Connector ${CONNECTOR_NAME} already exists, updating..."
    curl -X PUT -H "Content-Type: application/json" \
      -d @"$CONFIG_FILE" \
      "http://${CONNECT_HOST}/connectors/${CONNECTOR_NAME}/config"
  else
    echo "Creating connector ${CONNECTOR_NAME}..."
    curl -X POST -H "Content-Type: application/json" \
      -d @"$CONFIG_FILE" \
      "http://${CONNECT_HOST}/connectors"
  fi

  echo ""
  echo "Connector status:"
  curl -s "http://${CONNECT_HOST}/connectors/${CONNECTOR_NAME}/status" | jq .
  ```

### 4. Create CDC Pipeline Python Package
- **Task ID**: create-pipeline-config
- **Depends On**: none
- **Assigned To**: builder-generator
- **Agent Type**: builder
- **Parallel**: true (can run alongside tasks 1-3)
- Create directory `/Users/slysik/Downloads/piam-dashboard/cdc-pipeline/`
- Create `cdc-pipeline/requirements.txt`:
  ```
  mysql-connector-python>=8.0.0
  clickhouse-connect>=0.7.0
  kafka-python>=2.0.0
  python-dotenv>=1.0.0
  ```
- Create `cdc-pipeline/Dockerfile`:
  ```dockerfile
  FROM python:3.11-slim
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install --no-cache-dir -r requirements.txt
  COPY . .
  CMD ["python", "generator.py"]
  ```
- Create `cdc-pipeline/config.py`:
  ```python
  """Shared configuration for CDC pipeline components."""
  import os
  from dataclasses import dataclass

  @dataclass
  class Config:
      # Ingestion mode: 'cdc' or 'direct'
      ingest_mode: str = os.getenv('INGEST_MODE', 'cdc')

      # MySQL settings
      mysql_host: str = os.getenv('MYSQL_HOST', 'mysql')
      mysql_port: int = int(os.getenv('MYSQL_PORT', '3306'))
      mysql_user: str = os.getenv('MYSQL_USER', 'root')
      mysql_password: str = os.getenv('MYSQL_PASSWORD', 'rootpass')
      mysql_database: str = os.getenv('MYSQL_DATABASE', 'cloudgate')

      # ClickHouse settings
      clickhouse_host: str = os.getenv('CLICKHOUSE_HOST', 'clickhouse')
      clickhouse_port: int = int(os.getenv('CLICKHOUSE_PORT', '8123'))
      clickhouse_database: str = os.getenv('CLICKHOUSE_DATABASE', 'piam')

      # Kafka/Redpanda settings
      kafka_bootstrap: str = os.getenv('KAFKA_BOOTSTRAP', 'redpanda:9092')
      kafka_group_id: str = os.getenv('KAFKA_GROUP_ID', 'cdc-consumer-group')

      # Generator settings
      event_rate_per_second: float = float(os.getenv('EVENT_RATE_PER_SECOND', '10'))
      health_interval_seconds: int = int(os.getenv('HEALTH_INTERVAL_SECONDS', '10'))

      # Consumer settings
      flush_interval_seconds: int = int(os.getenv('FLUSH_INTERVAL_SECONDS', '4'))
      max_batch_events: int = int(os.getenv('MAX_BATCH_EVENTS', '200'))
      max_batch_health: int = int(os.getenv('MAX_BATCH_HEALTH', '10'))

      # Demo tenants (match existing data)
      tenants: list = None

      def __post_init__(self):
          self.tenants = ['acme', 'buildright']

  config = Config()
  ```

### 5. Build Python Generator
- **Task ID**: build-generator
- **Depends On**: create-pipeline-config
- **Assigned To**: builder-generator
- **Agent Type**: builder
- **Parallel**: false
- Create `cdc-pipeline/generator.py`:
  - Imports: mysql.connector, clickhouse_connect, uuid, random, datetime, time, json, signal
  - Simulates 4 PACS connectors matching existing dashboard:
    - Lenel Primary (OnGuard) - connector_id: 'lenel-primary'
    - C-CURE Satellite (C-CURE 9000) - connector_id: 'ccure-satellite'
    - S2 Building B (S2 NetBox) - connector_id: 's2-building-b'
    - Genetec Campus (Synergis) - connector_id: 'genetec-campus'
  - Generate access events with:
    - Realistic badge_id, person_id from existing dim_person (query ClickHouse for IDs)
    - site_id, location_id from existing dims
    - 75% GRANT, 25% DENY (configurable)
    - Deny reasons: INVALID_BADGE, EXPIRED_BADGE, NO_ENTITLEMENT, ANTIPASSBACK, SCHEDULE_VIOLATION
    - raw_payload as JSON <= 2KB
    - suspicious_flag on ~5% of events with scores
  - Generate connector health every 10 seconds:
    - Status distribution: 85% OK, 10% WARN, 5% DOWN
    - Realistic latency_ms (50-500ms normal, 1000+ for WARN)
    - events_per_minute based on actual generator rate
  - Support dual mode:
    - `INGEST_MODE=cdc`: Write to MySQL tables
    - `INGEST_MODE=direct`: Write directly to ClickHouse (fallback)
  - Graceful shutdown on SIGTERM/SIGINT
  - Logging with timestamps

### 6. Build Python CDC Consumer
- **Task ID**: build-consumer
- **Depends On**: create-pipeline-config
- **Assigned To**: builder-consumer
- **Agent Type**: builder
- **Parallel**: true (can run alongside task 5)
- Create `cdc-pipeline/mapping.py`:
  ```python
  """Field mapping from MySQL cg_* tables to ClickHouse piam.* tables."""

  def map_access_event(cdc_record: dict) -> dict:
      """Map cg_access_event CDC record to piam.fact_access_events row."""
      return {
          'event_id': cdc_record['event_id'],
          'tenant_id': cdc_record['tenant_id'],
          'event_time': cdc_record['event_time'],
          'person_id': cdc_record.get('person_id'),
          'badge_id': cdc_record['badge_id'],
          'site_id': cdc_record['site_id'],
          'location_id': cdc_record['location_id'],
          'direction': cdc_record['direction'],
          'result': cdc_record['result'],
          'event_type': cdc_record['event_type'],
          'deny_reason': cdc_record.get('deny_reason'),
          'deny_code': cdc_record.get('deny_code'),
          'pacs_source': cdc_record['pacs_source'],
          'pacs_event_id': cdc_record['pacs_event_id'],
          'raw_payload': cdc_record.get('raw_payload', ''),
          'suspicious_flag': cdc_record.get('suspicious_flag', 0),
          'suspicious_reason': cdc_record.get('suspicious_reason'),
          'suspicious_score': cdc_record.get('suspicious_score', 0.0),
      }

  def map_connector_health(cdc_record: dict) -> dict:
      """Map cg_connector_health CDC record to piam.fact_connector_health row."""
      return {
          'tenant_id': cdc_record['tenant_id'],
          'connector_id': cdc_record['connector_id'],
          'connector_name': cdc_record['connector_name'],
          'pacs_type': cdc_record['pacs_type'],
          'pacs_version': cdc_record.get('pacs_version'),
          'check_time': cdc_record['check_time'],
          'status': cdc_record['status'],
          'latency_ms': cdc_record['latency_ms'],
          'events_per_minute': cdc_record['events_per_minute'],
          'error_count_1h': cdc_record.get('error_count_1h', 0),
          'last_event_time': cdc_record.get('last_event_time'),
          'error_message': cdc_record.get('error_message'),
          'error_code': cdc_record.get('error_code'),
          'endpoint_url': cdc_record.get('endpoint_url'),
          'last_successful_sync': cdc_record.get('last_successful_sync'),
      }
  ```
- Create `cdc-pipeline/consumer.py`:
  - Subscribe to Debezium topics:
    - `cg.cloudgate.cg_access_event`
    - `cg.cloudgate.cg_connector_health`
  - Parse JSON records (already unwrapped by Debezium SMT)
  - Buffer records in memory (max 5000 to prevent runaway)
  - Flush to ClickHouse every 4 seconds or when batch limits reached:
    - Access events: max 200 per batch
    - Health records: max 10 per batch
  - Use `clickhouse_connect` client with INSERT statements
  - Handle only 'c' (create) and 'u' (update) operations, ignore 'd' (delete)
  - Commit Kafka offsets after successful ClickHouse insert
  - Graceful shutdown: commit final offsets on SIGTERM
  - Health endpoint on port 8084 (optional, for liveness checks)
  - Logging with timestamps and record counts

### 7. Create Makefile Targets
- **Task ID**: create-makefile-targets
- **Depends On**: update-docker-compose, build-generator, build-consumer
- **Assigned To**: builder-scripts
- **Agent Type**: builder
- **Parallel**: false
- Modify `/Users/slysik/Downloads/piam-dashboard/Makefile` to add these targets:
  ```makefile
  # =============================================================================
  # CDC DEMO MODE
  # =============================================================================

  demo-up: ## Start CDC demo stack (MySQL + Redpanda + Debezium + ClickHouse)
  	@echo "Starting CDC Demo Stack..."
  	docker compose up -d mysql redpanda clickhouse
  	@echo "Waiting for MySQL and Redpanda to be ready..."
  	@sleep 15
  	docker compose up -d debezium-connect
  	@echo "Waiting for Debezium Connect to initialize..."
  	@sleep 10
  	@./ops/debezium/register-connector.sh
  	@echo "Starting generator and consumer..."
  	docker compose up -d generator consumer
  	@sleep 5
  	$(MAKE) demo-verify --no-print-directory

  demo-down: ## Stop CDC demo stack
  	docker compose down

  demo-reset: ## Reset CDC demo (truncate recent data, restart)
  	@echo "Resetting CDC demo..."
  	docker exec piam-clickhouse clickhouse-client --database=piam --query="ALTER TABLE fact_access_events DELETE WHERE event_time > now() - INTERVAL 1 DAY"
  	docker exec piam-clickhouse clickhouse-client --database=piam --query="ALTER TABLE fact_connector_health DELETE WHERE check_time > now() - INTERVAL 1 DAY"
  	docker compose restart generator consumer
  	@echo "Demo reset complete"

  demo-verify: ## Verify CDC pipeline is flowing
  	@echo "=== CDC Pipeline Verification ==="
  	@python3 scripts/demo-verify.py

  demo-logs: ## Tail CDC component logs
  	docker compose logs -f generator consumer debezium-connect
  ```

### 8. Create Verification Script
- **Task ID**: create-verify-script
- **Depends On**: create-makefile-targets
- **Assigned To**: builder-scripts
- **Agent Type**: builder
- **Parallel**: false
- Create `scripts/demo-verify.py`:
  ```python
  #!/usr/bin/env python3
  """Verify CDC pipeline health and data flow."""
  import subprocess
  import json
  import sys
  from datetime import datetime

  def run_ch_query(query):
      """Run ClickHouse query and return result."""
      result = subprocess.run(
          ['docker', 'exec', 'piam-clickhouse', 'clickhouse-client',
           '--database=piam', '--format=JSON', f'--query={query}'],
          capture_output=True, text=True
      )
      if result.returncode != 0:
          return None
      return json.loads(result.stdout)

  def check_mysql():
      """Check MySQL is accepting connections."""
      result = subprocess.run(
          ['docker', 'exec', 'piam-mysql', 'mysqladmin', 'ping', '-u', 'root', '-prootpass'],
          capture_output=True
      )
      return result.returncode == 0

  def check_debezium():
      """Check Debezium connector status."""
      result = subprocess.run(
          ['docker', 'exec', 'piam-debezium-connect', 'curl', '-s',
           'http://localhost:8083/connectors/cloudgate-mysql-connector/status'],
          capture_output=True, text=True
      )
      if result.returncode != 0:
          return False, "Connector not reachable"
      status = json.loads(result.stdout)
      state = status.get('connector', {}).get('state', 'UNKNOWN')
      return state == 'RUNNING', state

  def main():
      print("=" * 50)
      print("CDC Pipeline Verification")
      print("=" * 50)

      # Check services
      print("\n[Services]")
      print(f"  MySQL: {'OK' if check_mysql() else 'FAIL'}")

      dbz_ok, dbz_state = check_debezium()
      print(f"  Debezium: {dbz_state}")

      # Check data flow
      print("\n[Data Flow - Last 10 Minutes]")

      events = run_ch_query(
          "SELECT count() as cnt, max(event_time) as latest "
          "FROM fact_access_events WHERE event_time > now() - INTERVAL 10 MINUTE"
      )
      if events and events['data']:
          row = events['data'][0]
          print(f"  Access Events: {row['cnt']} (latest: {row['latest']})")

      health = run_ch_query(
          "SELECT count() as cnt, max(check_time) as latest "
          "FROM fact_connector_health WHERE check_time > now() - INTERVAL 10 MINUTE"
      )
      if health and health['data']:
          row = health['data'][0]
          print(f"  Health Checks: {row['cnt']} (latest: {row['latest']})")

      # Summary
      print("\n[Summary]")
      events_flowing = events and events['data'] and int(events['data'][0]['cnt']) > 0
      health_flowing = health and health['data'] and int(health['data'][0]['cnt']) > 0

      if events_flowing and health_flowing and dbz_ok:
          print("  Status: HEALTHY - Data flowing through CDC pipeline")
          return 0
      else:
          print("  Status: DEGRADED - Check component logs with 'make demo-logs'")
          return 1

  if __name__ == '__main__':
      sys.exit(main())
  ```

### 9. Validate Full Pipeline
- **Task ID**: validate-pipeline
- **Depends On**: update-docker-compose, create-mysql-schema, create-debezium-config, build-generator, build-consumer, create-makefile-targets, create-verify-script
- **Assigned To**: validator-pipeline
- **Agent Type**: validator
- **Parallel**: false
- **Infrastructure Validation:**
  - Run `make demo-up` and verify all services start
  - Check memory usage stays under 2.5GB total with `docker stats`
- **Data Pipeline Validation:**
  - Verify MySQL has data in `cg_access_event` table
  - Verify Debezium connector is RUNNING
  - Verify ClickHouse `piam.fact_access_events` is receiving new rows
  - Verify `piam.fact_connector_health` is updating every 10 seconds
  - Run `make demo-verify` and confirm HEALTHY status
  - Test `make demo-reset` restarts cleanly
- **Frontend Compatibility Validation (CRITICAL):**
  - Run `git diff backup-site/` - must show ZERO changes
  - Stop Docker stack, start backup-site, verify "Demo Data" mode works with hardcoded data
  - Start Docker stack, verify "Live Data" mode shows real-time updates
  - Toggle between modes multiple times without errors

## Acceptance Criteria

### Infrastructure
- [ ] `docker compose up -d` starts MySQL, Redpanda, Debezium, ClickHouse, generator, consumer
- [ ] Superset service is removed from docker-compose.yml
- [ ] MySQL binlog is enabled and Debezium captures changes
- [ ] **Total container memory under 2.5GB** on 8GB Mac (verify with `docker stats`)

### Data Pipeline
- [ ] Generator writes ~10 events/second to MySQL (configurable)
- [ ] Consumer inserts micro-batches to ClickHouse every 4 seconds
- [ ] ClickHouse `fact_access_events` shows new rows with `max(event_time)` updating
- [ ] ClickHouse `fact_connector_health` shows 4 connectors with recent `check_time`

### Operations
- [ ] `make demo-up` is one-command startup
- [ ] `make demo-reset` truncates and restarts cleanly
- [ ] `make demo-verify` reports HEALTHY status

### Frontend Compatibility (CRITICAL)
- [ ] **Hardcoded mode works WITHOUT Docker**: Stop all containers, open backup-site, toggle OFF → hardcoded data displays correctly
- [ ] **Live mode works WITH Docker**: Start CDC stack, open backup-site, toggle ON → live updating data displays
- [ ] **No frontend file changes**: `git diff backup-site/` shows zero changes
- [ ] **Toggle switch works**: Can flip between Demo Data ↔ Live Data without errors

## Validation Commands
Execute these commands to validate the task is complete:

### Infrastructure Checks
- `docker compose ps` - Verify all 6 services running (mysql, redpanda, debezium-connect, clickhouse, generator, consumer)
- `docker stats --no-stream` - **Verify total memory under 2.5GB**

### Data Pipeline Checks
- `docker exec piam-mysql mysql -u root -prootpass -e "SELECT COUNT(*) FROM cloudgate.cg_access_event"` - Verify MySQL has data
- `curl -s localhost:8083/connectors/cloudgate-mysql-connector/status | jq .connector.state` - Should return "RUNNING"
- `docker exec piam-clickhouse clickhouse-client --database=piam --query="SELECT count(), max(event_time) FROM fact_access_events WHERE event_time > now() - INTERVAL 5 MINUTE"` - Should show growing count
- `docker exec piam-clickhouse clickhouse-client --database=piam --query="SELECT connector_id, max(check_time) FROM fact_connector_health GROUP BY connector_id"` - Should show 4 connectors
- `make demo-verify` - Should report HEALTHY

### Frontend Compatibility Checks (CRITICAL)
```bash
# 1. Verify NO frontend changes
git diff backup-site/
# Expected: no output (zero changes)

# 2. Test hardcoded mode (Docker DOWN)
docker compose down
cd backup-site && npm run dev
# Open http://localhost:3000, toggle to "Demo Data" → Should show hardcoded data

# 3. Test live mode (Docker UP)
cd .. && make demo-up
# Open http://localhost:3000, toggle to "Live Data" → Should show updating data
```

## Notes
- **No frontend changes**: The backup-site already supports ClickHouse mode - this plan only adds the data pipeline
- **Existing schema unchanged**: ClickHouse `piam.*` tables remain exactly as-is
- **Dual mode**: `INGEST_MODE=direct` bypasses MySQL/CDC entirely for quick fallback
- **Memory optimization (8GB Mac safe)**:
  - All services have explicit `mem_limit` in docker-compose
  - Redpanda: single-broker, development mode, 200MB internal limit
  - MySQL: InnoDB buffer pool capped at 64MB
  - Debezium: JVM heap capped at 256MB
  - Python apps: 64MB each (lightweight)
  - Total: ~2.1GB containers, leaving 6GB for macOS + browser + IDE
- **Offline demo**: Entire stack runs locally with no internet dependency
- **Python dependencies**: Use `mysql-connector-python`, `clickhouse-connect`, `kafka-python`
