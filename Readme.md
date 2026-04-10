# 🚀 NotifyFlow

├── **🏗️ infra/**
│   ├── 📄 .gitignore
│   └── 🐳 docker-compose.yml
├── **🧩 services/**
│   ├── **📁 analytics-service/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 logger.js
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🎮 controllers/**
│   │   │   │   ├── 🎮 analytics.controller.js
│   │   │   │   └── 🎮 queueStats.controller.js
│   │   │   ├── **📬 queues/**
│   │   │   │   └── 📜 index.js
│   │   │   ├── **🛣️ routes/**
│   │   │   │   ├── 🛣️ analytics.routes.js
│   │   │   │   └── 🛣️ queueStats.routes.js
│   │   │   ├── **🧩 services/**
│   │   │   │   ├── ⚙️ analytics.service.js
│   │   │   │   └── ⚙️ queueStats.service.js
│   │   │   └── 📜 server.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   ├── **📁 email-service/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🔄 processors/**
│   │   │   │   └── 🔄 email.processor.js
│   │   │   ├── **📬 queues/**
│   │   │   │   └── 📜 dlq-email.js
│   │   │   ├── **⚙️ service/**
│   │   │   │   ├── 📜 emailSender.js
│   │   │   │   └── ⚙️ notificationStatus.service.js
│   │   │   └── 📜 worker.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   ├── **📁 notification-api/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔌 clients/**
│   │   │   │   └── 🔌 template.client.js
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 frequencyCaps.js
│   │   │   │   ├── 📜 logger.js
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🎮 controllers/**
│   │   │   │   ├── 🎮 getNotificationById.controller.js
│   │   │   │   ├── 🎮 getNotificationEventsById.controller.js
│   │   │   │   ├── 🎮 notification.controller.js
│   │   │   │   └── 🎮 userPreference.controller.js
│   │   │   ├── **🧱 middleware/**
│   │   │   │   ├── 📜 idempotency.js
│   │   │   │   └── 📜 rateLimiter.js
│   │   │   ├── **📬 queues/**
│   │   │   │   └── 📜 notification.queues.js
│   │   │   ├── **🛣️ routes/**
│   │   │   │   ├── 🛣️ notification.routes.js
│   │   │   │   └── 🛣️ userPreference.routes.js
│   │   │   ├── **🧩 services/**
│   │   │   │   ├── ⚙️ frequencyCap.service.js
│   │   │   │   ├── ⚙️ getNotificationById.service.js
│   │   │   │   ├── ⚙️ getNotificationEventsById.service.js
│   │   │   │   ├── ⚙️ notification.service.js
│   │   │   │   ├── ⚙️ notificationStatus.service.js
│   │   │   │   └── ⚙️ userPreference.service.js
│   │   │   └── 📜 server.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   ├── **📁 push-service/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🔄 processors/**
│   │   │   │   └── 🔄 push.processor.js
│   │   │   ├── **📬 queues/**
│   │   │   │   └── 📜 dlq-push.js
│   │   │   ├── **⚙️ service/**
│   │   │   │   ├── ⚙️ notificationStatus.service.js
│   │   │   │   └── 📜 pushSender.js
│   │   │   └── 📜 worker.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   ├── **📁 sms-service/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🔄 processors/**
│   │   │   │   └── 🔄 sms.processor.js
│   │   │   ├── **📬 queues/**
│   │   │   │   └── 📜 dlq-sms.js
│   │   │   ├── **⚙️ service/**
│   │   │   │   ├── ⚙️ notificationStatus.service.js
│   │   │   │   └── 📜 smsSender.js
│   │   │   └── 📜 worker.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   ├── **📁 template-service/**
│   │   ├── **🗄️ prisma/**
│   │   │   └── 🗄️ schema.prisma
│   │   ├── **📂 src/**
│   │   │   ├── **🔧 config/**
│   │   │   │   ├── 📜 prisma.js
│   │   │   │   └── 📜 redis.js
│   │   │   ├── **🎮 controllers/**
│   │   │   │   └── 🎮 template.controller.js
│   │   │   ├── **🛣️ routes/**
│   │   │   │   └── 🛣️ template.routes.js
│   │   │   ├── **🧩 services/**
│   │   │   │   └── ⚙️ template.service.js
│   │   │   ├── **🛠️ utils/**
│   │   │   │   └── 📜 templateCache.js
│   │   │   └── 📜 server.js
│   │   ├── 📄 .dockerignore
│   │   ├── 📄 .env
│   │   ├── 📄 .gitignore
│   │   ├── 🐳 dockerfile
│   │   ├── 🔒 package-lock.json
│   │   ├── 📦 package.json
│   │   └── 📘 prisma.config.ts
│   └── **📁 whatsapp-service/**
│       ├── **🗄️ prisma/**
│       │   └── 🗄️ schema.prisma
│       ├── **📂 src/**
│       │   ├── **🔧 config/**
│       │   │   ├── 📜 prisma.js
│       │   │   └── 📜 redis.js
│       │   ├── **🔄 processors/**
│       │   │   └── 🔄 whatsapp.processor.js
│       │   ├── **📬 queues/**
│       │   │   └── 📜 dlq-whatsapp.js
│       │   ├── **⚙️ service/**
│       │   │   ├── ⚙️ notificationStatus.service.js
│       │   │   └── 📜 whatsappSender.js
│       │   └── 📜 worker.js
│       ├── 📄 .dockerignore
│       ├── 📄 .env
│       ├── 📄 .gitignore
│       ├── 🐳 dockerfile
│       ├── 🔒 package-lock.json
│       ├── 📦 package.json
│       └── 📘 prisma.config.ts
├── **🤝 shared/**
│   └── **📁 db/**
│       ├── **🗄️ prisma/**
│       │   ├── **🧬 migrations/**
│       │   │   ├── **📁 20260402151659_init/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260402164543_notification_status_update/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260403102839_add_recipient_to_notification_event/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260404062004_add_whatsapp_channel/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260404111134_idempotency/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260404142122_template_service/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260406164149_strengthen_idempotency/**
│       │   │   │   └── 📄 migration.sql
│       │   │   ├── **📁 20260410114120_added_user_prefrence_and_user_notification_cap/**
│       │   │   │   └── 📄 migration.sql
│       │   │   └── 📄 migration_lock.toml
│       │   └── 🗄️ schema.prisma
│       ├── **📂 src/**
│       │   └── 📜 prismaClient.js
│       ├── 📄 .dockerignore
│       ├── 📄 .env
│       ├── 📄 .gitignore
│       ├── 🐳 dockerfile
│       ├── 🔒 package-lock.json
│       ├── 📦 package.json
│       └── 📘 prisma.config.ts
├── 📝 project_structure_icons.md
├── 📄 project_tree.py
└── 📝 Readme.md