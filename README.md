# NotifyFlow

> A distributed, multi-channel notification delivery platform built for reliability, scalability, and fault tolerance.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![BullMQ](https://img.shields.io/badge/BullMQ-Queue-FF6B35?style=flat-square)](https://bullmq.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io)

---

## Overview

NotifyFlow decouples notification **request handling**, **processing**, and **delivery** into independent microservices. Rather than sending notifications synchronously from a single server, each channel — Email, SMS, Push, and WhatsApp — is handled by a dedicated worker service that consumes jobs from its own BullMQ queue.

The result is a system that handles failures gracefully, scales per channel independently, and provides full observability over every notification lifecycle.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client / API Consumer                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │  POST /notifications
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         notification-api                            │
│  • Idempotency middleware   • Frequency cap (Redis)                 │
│  • User preference check   • Template rendering (→ template-service)│
│  • Event creation          • Queue dispatch                         │
└──────┬──────────┬──────────┬──────────┬──────────────────────────── ┘
       │          │          │          │
  email-queue  sms-queue push-queue whatsapp-queue
       │          │          │          │
       ▼          ▼          ▼          ▼
┌────────┐  ┌────────┐ ┌────────┐ ┌──────────┐
│ email  │  │  sms   │ │  push  │ │ whatsapp │   ← Channel Workers
│service │  │service │ │service │ │ service  │
└────┬───┘  └────┬───┘ └────┬───┘ └─────┬────┘
     │           │          │           │
     └───────────┴──────────┴───────────┘
                            │
                     ┌──────▼──────┐
                     │  PostgreSQL │   (via shared/db Prisma schema)
                     └─────────────┘
                            │
                     ┌──────▼──────┐
                     │  analytics  │
                     │   service   │
                     └─────────────┘
```

---

## Services

| Service | Role | Port |
|---|---|---|
| `notification-api` | Main entry point — accepts requests, applies rules, dispatches jobs | 3000 |
| `email-service` | BullMQ worker — consumes and delivers email notifications | — |
| `sms-service` | BullMQ worker — consumes and delivers SMS notifications | — |
| `push-service` | BullMQ worker — consumes and delivers push notifications | — |
| `whatsapp-service` | BullMQ worker — consumes and delivers WhatsApp notifications | — |
| `template-service` | Stores and renders notification templates with variable substitution | 3001 |
| `analytics-service` | Provides metrics — counts, channel stats, queue stats, delivery rates | 3002 |
| `shared/db` | Central Prisma schema, migrations, and shared database client | — |

---

## Notification Lifecycle

Every notification request passes through a well-defined pipeline:

```
POST /notifications
        │
        ▼
   Validation
   (required fields, channel mapping)
        │
        ▼
   Template Rendering  ──────────►  template-service
   (if templateName provided)
        │
        ▼
   User Preference Check
   (emailEnabled / smsEnabled / etc.)
        │
        ├── DISABLED → event.status = SKIPPED (skipReason: CHANNEL_DISABLED)
        │
        ▼
   Frequency Cap Check  ──────────►  Redis sorted sets
   (per userId + channel)
        │
        ├── EXCEEDED → event.status = SKIPPED (skipReason: FREQUENCY_CAP_REACHED)
        │
        ▼
   NotificationEvent created  (status: PENDING)
        │
        ▼
   Job pushed to BullMQ queue
        │
        ▼
   Channel worker consumes job
   → status: PROCESSING → SUCCESS | FAILED
        │
        ├── FAILED (retryable) → exponential backoff retry (max 3 attempts)
        └── FAILED (exhausted) → moved to Dead Letter Queue
```

---

## Notification Status

A single notification can target multiple channels. Each channel gets its own `NotificationEvent`. The parent notification's status is derived from its events.

| Scenario | Notification Status |
|---|---|
| All events succeeded | `SUCCESS` |
| All events failed | `FAILED` |
| All events skipped | `SKIPPED` |
| Mix of success and failure | `PARTIAL_SUCCESS` |
| Processing in progress | `PROCESSING` |
| Awaiting worker | `PENDING` |

---

## Key Features

### Idempotency

All notification requests support an idempotency key. Duplicate requests using the same key return the original response immediately — protecting against client retries and network-level duplicates.

### User Preferences

Users control which channels they receive notifications on. Disabled channels produce `SKIPPED` events without touching any external provider.

```http
GET  /preferences/:userId
PUT  /preferences/:userId

{
  "emailEnabled": true,
  "smsEnabled": false,
  "pushEnabled": true,
  "whatsappEnabled": true
}
```

### Frequency Capping

Redis sorted sets enforce per-user, per-channel delivery limits. Expired window entries are removed before each check.

```
Key format:   cap:user:{userId}:channel:{channel}

Default caps:
  EMAIL     → 3 per day
  SMS       → 2 per day
```

### Dead Letter Queues

Each channel maintains its own DLQ. Jobs that exhaust all retry attempts are moved there for investigation rather than silently discarded.

```
failed-email-queue
failed-sms-queue
failed-push-queue
failed-whatsapp-queue
```

### Templates

Templates are stored in the database and rendered server-side using variable substitution via the `template-service`. Requests can pass a `templateName` + `variables` instead of a raw message body.

---

## API Reference

### Send a Notification

```http
POST /notifications
Content-Type: application/json
Idempotency-Key: <optional-unique-key>

{
  "userId": "user_123",
  "channels": ["EMAIL", "SMS"],
  "recipients": {
    "email": "user@example.com",
    "phone": "+919876543210"
  },
  "templateName": "welcome",
  "variables": {
    "firstName": "Aryan"
  }
}
```

Or with a raw message body:

```json
{
  "userId": "user_123",
  "channels": ["PUSH"],
  "recipients": {
    "deviceToken": "fcm-token-here"
  },
  "message": "Your order has been shipped."
}
```

### Get Notification Status

```http
GET /notifications/:id
GET /notifications/:id/events
```

### User Preferences

```http
GET /preferences/:userId
PUT /preferences/:userId
```

---

## Analytics

The analytics service exposes system health and delivery metrics:

- Total notifications sent
- Notifications broken down by channel
- Status distribution (SUCCESS / FAILED / SKIPPED / PARTIAL\_SUCCESS)
- Recent notification activity feed
- Live queue statistics (waiting, active, completed, failed per queue)

```http
GET /analytics/summary
GET /analytics/queue-stats
```

---

## Getting Started

### Prerequisites

- Docker and Docker Compose

### Run Locally

```bash
# Clone the repository
git clone https://github.com/your-username/notifyflow.git
cd notifyflow

# Start all services
docker compose -f infra/docker-compose.yml up --build
```

Docker Compose will start:

- `notification-api` on port 3000
- `template-service` on port 3001
- `analytics-service` on port 3002
- `postgres` (database)
- `redis` (queues + caching)
- All four channel worker services
- `shared-db` migration runner (runs once and exits)

### Environment Variables

Each service has a `.env` file. Key variables across services:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `TEMPLATE_SERVICE_URL` | Internal URL for the template service |

---

## Project Structure

```
notifyflow/
├── infra/
│   └── docker-compose.yml
├── services/
│   ├── notification-api/       # Main API gateway
│   ├── email-service/          # Email worker
│   ├── sms-service/            # SMS worker
│   ├── push-service/           # Push notification worker
│   ├── whatsapp-service/       # WhatsApp worker
│   ├── template-service/       # Template storage and rendering
│   └── analytics-service/      # Metrics and observability
└── shared/
    └── db/                     # Prisma schema, migrations, client
        └── prisma/
            ├── schema.prisma
            └── migrations/
```

Each service follows a consistent internal layout:

```
service-name/
├── src/
│   ├── config/         # Prisma, Redis, logger setup
│   ├── processors/     # BullMQ job processor logic
│   ├── queues/         # Queue and DLQ definitions
│   ├── service/        # Business logic
│   └── worker.js       # Worker entry point
├── prisma/
│   └── schema.prisma   # Local schema reference
├── dockerfile
└── package.json
```

---

## Design Principles

NotifyFlow is built around five core principles:

**Asynchronous by default** — No notification is sent synchronously. All delivery happens through queues, keeping API response times fast and decoupled from provider latency.

**Service isolation** — Each channel runs as an independent process. An outage or slowdown in the SMS provider has zero impact on email or push delivery.

**Graceful failure** — Retries with exponential backoff handle transient failures. Permanent failures land in a Dead Letter Queue rather than vanishing silently.

**Safety by design** — Idempotency keys prevent duplicate sends. Frequency caps prevent spam. User preferences are enforced before any job is enqueued.

**Observable** — Every notification produces granular event records. The analytics service surfaces delivery rates, queue health, and channel performance.

---

## Tech Stack

- **Runtime** — Node.js
- **Queue** — BullMQ (backed by Redis)
- **Database** — PostgreSQL via Prisma ORM
- **Cache / Rate limiting** — Redis
- **Containerisation** — Docker Compose
- **Schema management** — Prisma Migrate

---

## License

MIT