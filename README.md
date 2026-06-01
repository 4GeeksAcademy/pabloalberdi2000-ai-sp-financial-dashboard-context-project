# Financial Metrics Dashboard

_This documentation is also available in Spanish in [README.es.md](README.es.md)._

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Technical Quickstart

### Prerequisites

- Docker and Docker Compose

### Run locally

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

### Stop services

```bash
docker compose down
```

## Project Structure

```text
backend/
   app/
   tests/
frontend/
   src/
   public/
.agents/rules/
memory-bank/
docker-compose.yml
```

## Development Workflow

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Validate backend and frontend behavior locally.
4. Follow governance rules in `.agents/rules/` for any code changes.
5. Update technical memory in `memory-bank/` when architecture or behavior changes.

## Agent Rules and Technical Memory

- Rules index: [.agents/rules/README.md](.agents/rules/README.md)
- Product context: [memory-bank/productContext.md](memory-bank/productContext.md)
- Tech context: [memory-bank/techContext.md](memory-bank/techContext.md)
- System status: [memory-bank/systemStatus.md](memory-bank/systemStatus.md)

## Expected Agents Directory Structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

The frontend uses the Vite proxy for `/api` by default, so no extra environment variables are required in local development or Codespaces.
If you need to target a different backend origin, copy `frontend/.env.example` to `.env` and set `VITE_API_BASE_URL`.

---

Project credits and contributor list are available in the repository insights and commit history.
