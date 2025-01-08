# Modern Full-Stack Monorepo Template

<div align="center">

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.0.0--rc.688-blue?style=for-the-badge&logo=trpc)](https://trpc.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-1.1.15-black?style=for-the-badge&logo=bun)](https://bun.sh/)
[![KeyDB](https://img.shields.io/badge/KeyDB-6.3.4-DC382D?style=for-the-badge&logo=redis)](https://docs.keydb.dev/)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.19.0-000000?style=for-the-badge&logo=drizzle)](https://drizzle.dev/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.3.3-000000?style=for-the-badge&logo=turborepo)](https://turbo.build/)

A high-performance, type-safe monorepo template engineered for building scalable web applications with modern best practices.

</div>

## 🏗 Architecture Overview

Our architecture follows a modern, scalable approach with clear separation of concerns:

```mermaid
graph TD
    A[Client Layer] --> B[API Layer]
    B --> C[Service Layer]
    C --> D[Data Layer]

    subgraph "Frontend (Next.js)"
    A
    end

    subgraph "tRPC Server"
    B
    end

    subgraph "Business Logic"
    C
    end

    subgraph "Storage"
    D --> E[(PostgreSQL)]
    D --> F[(KeyDB/Redis)]
    end
```

## 🚀 Tech Stack

### Frontend (apps/web)

- ![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=flat-square&logo=next.js) Server-side rendering & static generation
- ![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black) Modern React with Server Components
- ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat-square) High-quality, accessible components
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white) Utility-first styling
- ![next-themes](https://img.shields.io/badge/next--themes-000000?style=flat-square) Seamless dark/light theming

### Backend (apps/server)

- ![Bun](https://img.shields.io/badge/Bun_Runtime-000000?style=flat-square&logo=bun) High-performance JavaScript runtime
- ![tRPC](https://img.shields.io/badge/tRPC-2596BE?style=flat-square) End-to-end type-safe API layer
- ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-000000?style=flat-square) Type-safe database operations
- ![KeyDB](https://img.shields.io/badge/KeyDB-DC382D?style=flat-square&logo=redis&logoColor=white) High-performance Redis-compatible store

### Database (packages/database)

- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white) Primary database
- ![Drizzle](https://img.shields.io/badge/Drizzle_Migrations-000000?style=flat-square) Automated schema migrations
- ![KeyDB](https://img.shields.io/badge/KeyDB_Pub/Sub-DC382D?style=flat-square&logo=redis&logoColor=white) Real-time subscriptions

### Development & DevOps

- ![Turborepo](https://img.shields.io/badge/Turborepo-000000?style=flat-square&logo=turborepo) Optimized build system
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) Full-stack type safety
- ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint) Code quality
- ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black) Code formatting
- ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) Containerization

## 📦 Project Structure

```bash
.
├── apps/
│   ├── web/                 # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/        # App router pages
│   │   │   ├── components/ # Reusable UI components
│   │   │   └── trpc/      # tRPC client configuration
│   │   └── public/         # Static assets
│   │
│   └── server/             # Backend application
│       ├── src/
│       │   ├── routers/    # tRPC route handlers
│       │   ├── services/   # Business logic layer
│       │   └── utils/      # Helper functions
│       └── tests/          # Backend tests
│
└── packages/
    └── database/           # Shared database package
        ├── migrations/     # Database migrations
        └── src/
            ├── schema.ts   # Database schema
            └── index.ts    # Database client
```

## ✨ Key Features

- **Type Safety**: End-to-end type safety with TypeScript and tRPC
- **High Performance**: Optimized build system with Turborepo
- **Modern UI**: Responsive design with shadcn/ui and Tailwind CSS
- **Real-time**: WebSocket support via KeyDB pub/sub
- **Developer Experience**: Hot reload, type checking, and linting
- **Scalability**: Modular architecture for easy scaling
- **Security**: Built-in security best practices
- **Testing**: Ready-to-use testing setup

## 🚦 Getting Started

1. **Prerequisites**

   ```bash
   bun --version # >= 1.1.15
   node --version # >= 18.0.0
   ```

2. **Installation**

   ```bash
   # Clone the repository
   git clone https://github.com/DKeken/trpc-monorepo-stack.git

   # Install dependencies
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   # Copy environment files
   cp apps/web/.env.example apps/web/.env
   cp apps/server/.env.example apps/server/.env
   cp packages/database/.env.example packages/database/.env
   ```

4. **Development**
   ```bash
   # Start development servers
   pnpm dev
   ```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
