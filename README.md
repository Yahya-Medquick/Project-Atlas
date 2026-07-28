# Project Atlas — Universal Knowledge Engine 🗺️✨

> **Project Atlas** is an enterprise-grade intelligent knowledge exploration platform that organizes human knowledge into structured, interactive multi-dimensional categories across peer-reviewed scholarly literature, open-source codebases, AI synthesis, and interactive physics sandboxes.

---

## 🌟 Core Architectural Features

- **Categorized Multi-Dimensional Knowledge Engine**: Automatically organizes any topic (e.g., *Gravity*, *Quantum Computing*, *Photosynthesis*, *Machine Learning*) into 10 structured dimensions:
  1. **Overview**: Key facts, historical timeline, pioneering figures, core concepts, Wikipedia summary.
  2. **Education**: Step-by-step learning roadmaps, interactive quizzes, and free MIT/Khan Academy courses.
  3. **News**: Scientific press releases and global news feeds.
  4. **Software**: Live GitHub repositories sorted by stars, language badges, and topics.
  5. **Games & Simulations**: Real-time canvas physics sandboxes with controllable mass, speed, and particle counts.
  6. **Videos**: Educational lectures and visual explainers.
  7. **Books**: Google Books library previews with authors, page count, and ratings.
  8. **Research Papers**: Real live scientific literature from the OpenAlex scholarly database (DOIs, citation counts, open-access PDFs).
  9. **Communities**: Top Reddit threads, discussions, and Q&As.
  10. **Related Topics**: Interactive node-and-edge knowledge graph network visualization.

- **Performance Optimization**:
  - **Lazy Loading Per Category**: Zero wasted bandwidth. Categories load only on demand.
  - **Request Deduplication & Caching**: Prevents duplicate concurrent fetches and uses 15-minute client memory cache + 1-hour server Redis-style telemetry cache.
  - **Bundle Code Splitting**: Heavy components (simulations, knowledge graphs, admin dashboards, comparison modals) are code-split via `React.lazy` and `Suspense`.

- **Security & Hardening**:
  - **Tiered In-Memory Rate Limiting**: Endpoint-specific limits (150 rpm general, 25 rpm AI synthesis, 30 rpm admin).
  - **Global Input Sanitization**: Strips HTML tags, XSS scripts, null bytes, and control characters.
  - **Security HTTP Headers & CSP**: Helmet equivalent headers (`X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`).
  - **Bot & Scanner Blocking**: Filters out automated vulnerability scanners (`nikto`, `sqlmap`, `nmap`).
  - **Admin Route Authorization**: Protected mutation endpoints using authorization tokens.

- **Production Observability & Operations**:
  - **Liveness Probe**: `/api/v1/health`
  - **Readiness Probe**: `/api/v1/ready`
  - **Prometheus-Style Telemetry & Metrics**: `/api/v1/metrics`
  - **Structured JSON Logging**: Centralized error interceptor and request tracking.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   React + Vite Frontend │
                       └────────────┬────────────┘
                                    │ HTTP / REST (Deduplicated)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│             Express.js Security-Hardened Backend Server                │
│                                                                        │
│ ┌────────────────┐ ┌───────────────────┐ ┌───────────────────────────┐ │
│ │  Memory Cache  │ │  Gemini 3.6 Flash │ │ Live OpenAlex / Wiki /    │ │
│ │  (1-Hour TTL)  │ │  Synthesis Engine │ │ GitHub / Books / Reddit   │ │
│ └────────────────┘ └───────────────────┘ └───────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
                       ┌───────────────────────────┐
                       │ PostgreSQL / Supabase DB  │
                       └───────────────────────────┘
```

---

## 🚀 Development & Production Commands

```bash
# Install Dependencies
npm install

# Run Linter & Type Checker
npm run lint

# Run Automated Test Suite (Vitest)
npm test

# Start Local Dev Server (Express + Vite Dev Middleware)
npm run dev

# Build Production Bundle (Vite SPA + Bundled server.cjs)
npm run build

# Start Production Server
npm start
```

---

## 🐳 Docker Support

Build and run using the optimized multi-stage `Dockerfile`:

```bash
# Build Docker Image
docker build -t project-atlas:latest .

# Run Production Container
docker run -d -p 3000:3000 --name atlas-app \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-key" \
  project-atlas:latest
```

---

## 📑 Production Documentation Index

- 📘 [DEPLOYMENT.md](./DEPLOYMENT.md) — Production Deployment Guide (Cloud Run, Kubernetes, AWS ECS, Nginx, SSL).
- 🛠️ [OPERATIONS.md](./OPERATIONS.md) — Operational Monitoring, Logging, Backup & Recovery Strategy.
- ✅ [CHECKLIST.md](./CHECKLIST.md) — Production Go-Live Verification Checklist.
- ⚙️ [.github/workflows/ci.yml](./.github/workflows/ci.yml) — Automated CI/CD GitHub Actions Pipeline.

---

## 📄 License
Apache 2.0. Project Atlas Universal Knowledge Engine.
