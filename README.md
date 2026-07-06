# Todo App — Full Stack with Auth, Docker, CI/CD, and AWS Deployment

A simple todo list app with user registration/login (JWT auth), a
Node/Express + PostgreSQL backend, and a plain HTML/CSS/JS frontend served
by Nginx. Fully dockerized, with a GitHub Actions pipeline that builds images
and deploys them to an EC2 instance backed by RDS.

## Project structure

```
todo-app/
├── backend/                 # Express API (auth + todos), Postgres via `pg`
│   ├── routes/               # auth.routes.js, todo.routes.js
│   ├── middleware/            # JWT auth middleware
│   ├── db.js                  # DB connection + auto schema creation
│   ├── server.js
│   └── Dockerfile
├── frontend/                 # Static HTML/CSS/JS, served by Nginx
│   ├── index.html             # Login / Register
│   ├── dashboard.html          # Todo list
│   ├── nginx.conf              # Proxies /api/* to backend container
│   └── Dockerfile
├── docker-compose.yml         # Local dev (frontend + backend + postgres)
├── docker-compose.prod.yml    # Production (frontend + backend + RDS)
├── terraform/                 # Provisions EC2 + RDS on AWS
├── .github/workflows/ci-cd.yml # Build → push to GHCR → deploy to EC2
└── DEPLOYMENT.md               # Full step-by-step deployment guide
```

## Run locally

```bash
docker compose up --build
```

Then open http://localhost — register a user and start adding todos.
The backend runs on port 5000, Postgres on 5432 (all wired together
automatically by docker-compose).

## How auth works

- Passwords are hashed with bcrypt before storage.
- On login/register, the backend issues a JWT (7-day expiry) signed with
  `JWT_SECRET`.
- The frontend stores the token in `localStorage` and sends it as
  `Authorization: Bearer <token>` on every todo API request.
- All `/api/todos/*` routes are protected by `middleware/authMiddleware.js`.

## API reference

| Method | Route              | Auth required | Description         |
|--------|--------------------|:---:|----------------------|
| POST   | `/api/auth/register` | No  | Create account, returns JWT |
| POST   | `/api/auth/login`    | No  | Login, returns JWT |
| GET    | `/api/todos`         | Yes | List your todos |
| POST   | `/api/todos`         | Yes | Create a todo `{ title }` |
| PUT    | `/api/todos/:id`     | Yes | Update `{ title?, completed? }` |
| DELETE | `/api/todos/:id`     | Yes | Delete a todo |

## Deploying to production (EC2 + RDS)

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full walkthrough:
provisioning EC2 + RDS (via Terraform or the AWS console), configuring
GitHub Actions secrets, and triggering the CI/CD pipeline.

## Environment variables (backend)

See `backend/.env.example`. In production these are supplied via
`docker-compose.prod.yml` + GitHub Actions secrets, not committed to the repo.
