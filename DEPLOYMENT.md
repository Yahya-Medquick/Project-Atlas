# Project Atlas — Production Deployment Guide

This guide details the step-by-step procedures for deploying **Project Atlas | Universal Knowledge Engine** into high-availability production environments.

---

## 1. System Requirements & Prerequisites

- **Node.js**: v22.0.0+ (ES Modules & Native TypeScript Type Stripping support)
- **Docker**: Engine v24.0+ & Docker Compose v2+
- **Memory**: Minimum 512 MB RAM (1 GB recommended per container instance)
- **CPU**: 1 vCPU per container instance
- **Storage**: Ephemeral or persistent storage for static bundle assets

---

## 2. Environment Configuration

Copy `.env.example` to `.env` or set environment variables in your container deployment service (Google Cloud Run, AWS ECS, Kubernetes, Vercel, Render):

```env
NODE_ENV="production"
PORT=3000
APP_URL="https://your-domain.com"
GEMINI_API_KEY="your-gemini-api-key"
ADMIN_TOKEN="your-custom-secure-admin-token"
OPENALEX_MAILTO="admin@your-domain.com"
GITHUB_TOKEN="your-github-personal-access-token"
YOUTUBE_API_KEY="your-google-youtube-api-key"
```

---

## 3. Local Production Build & Test

Validate compilation, type safety, unit tests, and production server execution locally before deploying:

```bash
# 1. Run Linter & Type Checker
npm run lint

# 2. Run Automated Test Suite
npm test

# 3. Build Production Bundle
npm run build

# 4. Start Production Server
npm start
```

---

## 4. Containerized Deployment with Docker

### A. Build Docker Image
```bash
docker build -t project-atlas:latest .
```

### B. Test Docker Container Locally
```bash
docker run -d \
  --name atlas-prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GEMINI_API_KEY="your-gemini-key" \
  -e ADMIN_TOKEN="your-admin-token" \
  project-atlas:latest
```

### C. Verify Container Health
```bash
curl http://localhost:3000/api/v1/health
```

---

## 5. Cloud Platform Deployments

### Option A: Google Cloud Run (Recommended)
```bash
# 1. Authenticate with Google Cloud
gcloud auth login

# 2. Build and Submit to Artifact Registry
gcloud builds submit --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/atlas/explorer:v1.0.0

# 3. Deploy Service to Cloud Run
gcloud run deploy project-atlas \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/atlas/explorer:v1.0.0 \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --min-instances 1 \
  --max-instances 10 \
  --cpu 1 \
  --memory 512Mi \
  --set-env-vars "NODE_ENV=production,APP_URL=https://project-atlas.app" \
  --set-secrets "GEMINI_API_KEY=GEMINI_KEY_SECRET:latest,ADMIN_TOKEN=ADMIN_TOKEN_SECRET:latest"
```

### Option B: Kubernetes (Helm / Manifests)
Apply deployment and service manifests:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: project-atlas
spec:
  replicas: 3
  selector:
    matchLabels:
      app: project-atlas
  template:
    metadata:
      labels:
        app: project-atlas
    spec:
      containers:
      - name: explorer
        image: project-atlas:latest
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: atlas-secrets
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
        readinessProbe:
          httpGet:
            path: /api/v1/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
```

---

## 6. Reverse Proxy & SSL/TLS Configuration (Nginx)

When deploying behind an Nginx gateway:

```nginx
server {
    listen 443 ssl http2;
    server_name project-atlas.app;

    ssl_certificate /etc/letsencrypt/live/project-atlas.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/project-atlas.app/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Automated Continuous Integration & Delivery (CI/CD)

The repository includes a GitHub Actions workflow `.github/workflows/ci.yml` that automatically:
1. Performs static analysis (`tsc --noEmit`).
2. Executes automated tests (`vitest run`).
3. Compiles production assets (`npm run build`).
4. Verifies multi-stage Docker build.
5. Deploys container artifacts directly to Google Cloud Run upon pushes to `main`.
