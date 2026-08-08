# Ascendo AI — The AI Growth Operating System

<p align="center">
  <b>🏆 Best Digital Marketing Product — RoboVanta 2K26</b>
</p>

<p align="center">
  Strategy, execution, and insight — finally moving as one.
</p>

---

## About

**Ascendo AI** is an AI-native growth operating system for businesses. Instead of
juggling separate tools for strategy, marketing, sales, lead generation, and
customer success, Ascendo AI runs them as a single coordinated system: a
council of specialized AI agents that analyze a business, build a growth
plan, and execute against it — with a live dashboard to track outcomes.

It was built to answer a simple question founders and operators keep asking:
*"I know what my business needs to do to grow — why do I still need five
different tools and a strategy consultant to actually do it?"*

Ascendo AI replaces that stack with one connected system that plans,
executes, and reports in a single loop.

## Recognition

**Ascendo AI was awarded Best Digital Marketing Product at RoboVanta 2K26**,
recognized for its multi-agent approach to autonomous business growth
planning and execution.

## Key Features

### 🧠 AI Agent Council
A coordinated set of specialized agents — Strategy, Marketing, Sales, Lead
Generation, Customer Success, and Analytics — each responsible for one
domain of business growth, orchestrated through a LangGraph-based workflow
that lets them reason together rather than in isolation.

### 📊 Growth Engines
Purpose-built analysis engines translate raw business context into concrete,
prioritized action:
- **Strategy Engine** — long-term positioning and growth roadmap
- **Marketing Engine** — campaign and channel recommendations
- **Sales Engine** — pipeline and conversion optimization
- **Lead Generation Engine** — acquisition strategy and targeting
- **Customer Success Engine** — retention and expansion plays
- **Analytics Engine** — performance measurement and reporting

### 🤖 AI Copilot
A conversational interface for querying your business's growth plan,
getting recommendations, and iterating on strategy in natural language.

### 📁 Document-Aware Planning
Upload business documents (e.g. a README, business plan, or product doc) and
Ascendo AI parses and grounds its recommendations in your actual business
context using a vector knowledge store (ChromaDB) for retrieval-augmented
reasoning.

### 📈 Live Dashboard & Reporting
Track growth opportunities, agent activity, and generated reports in a
real-time dashboard, with exportable reports for stakeholders.

### 🔐 Secure Multi-Tenant Accounts
JWT-based authentication, per-project workspaces, and Stripe-powered
subscription billing (Starter / Growth / Scale tiers) for teams operating
multiple businesses or clients.

## Product Architecture

Ascendo AI is a full-stack, cloud-ready application:

| Layer | Stack |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Framer Motion, Recharts, Three.js/React Three Fiber |
| **Backend** | FastAPI (Python 3.11), async architecture, Server-Sent Events for live agent streaming |
| **AI Orchestration** | LangGraph multi-agent workflow, pluggable LLM providers with automatic fallback (OSM/OpenAI-compatible, Groq, Z.ai, Hugging Face) |
| **Data** | MongoDB (application data), ChromaDB (vector store for document-grounded reasoning) |
| **Auth & Billing** | JWT authentication, Stripe subscriptions, SMTP transactional email |
| **Deployment** | Dockerized backend + MongoDB via `docker-compose`, Vite build for static frontend hosting |

## Security & Trust

Security is treated as a first-class product requirement, not an
afterthought:

- **Isolated secrets** — All credentials (LLM provider keys, database URIs,
  JWT signing secrets, SMTP and Stripe keys) live exclusively in local,
  git-ignored `.env` files and are never committed to source control.
- **Authenticated access** — Every non-public API route requires a valid
  JWT bearer token; passwords are hashed with bcrypt, never stored in
  plaintext.
- **Tenant isolation** — Projects, reports, and agent activity are scoped
  per authenticated account.
- **Least-privilege LLM access** — Outbound calls to LLM providers are
  routed through a controlled service layer with timeouts, retries, and
  provider fallback — the frontend never talks to an LLM provider directly.
- **Payment security** — Billing is handled entirely through Stripe;
  Ascendo AI never stores raw payment card data.
- **CORS-restricted API** — Cross-origin access is explicitly allow-listed
  per environment rather than left open.

## Getting Started (for authorized collaborators)

> This repository does not ship example data or credentials. You will need
> your own MongoDB instance and LLM/Stripe/SMTP provider keys to run a full
> instance locally.

```bash
# Backend
cd backend
python -m venv .venv
.venv/Scripts/activate      # Windows
pip install -r requirements.txt
cp .env.example .env        # then fill in your own credentials
uvicorn app.main:app --reload

# Frontend
cd ascendo-ai-frontend/ascendo-ai-frontend
npm install
# create a .env with VITE_API_BASE pointing at your backend
npm run dev
```

Or run the backend + MongoDB stack via Docker:

```bash
docker compose up --build
```

## License

**All Rights Reserved.**

Copyright © 2026 Vijay Kasthuri K. All rights reserved.

This repository and its contents (including all source code, design
assets, documentation, and product concepts) are made available for
**viewing purposes only**. No part of this repository may be copied,
reproduced, modified, merged, published, distributed, sublicensed, used to
create derivative works, or otherwise exploited — in whole or in part, for
commercial or non-commercial purposes — **without the express prior
written permission of the copyright holder**.

No license, express or implied, to any intellectual property rights is
granted by the publication of this repository on GitHub.

For permission requests, licensing inquiries, or partnership discussions,
please open an issue or contact the repository owner directly.

See [`LICENSE`](./LICENSE) for the full terms.

---

<p align="center">
  Built with ❤️ — Ascendo AI, the AI operating system your business grows on.
</p>
