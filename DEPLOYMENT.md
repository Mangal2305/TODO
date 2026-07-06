# Deployment Guide — EC2 + RDS + GitHub Actions CI/CD

This guide walks through taking the app from your laptop to a live EC2 server
backed by an RDS Postgres database, with GitHub Actions automatically
building and deploying on every push to `main`.

---

## 0. Prerequisites

- AWS account with CLI access (`aws configure` already run), or console access
- An EC2 key pair created in your target region (EC2 → Key Pairs → Create)
- Terraform installed locally (optional, but recommended) — https://developer.hashicorp.com/terraform/downloads
- A GitHub repository containing this project

---

## 1. Push this project to GitHub

```bash
cd todo-app
git init
git add .
git commit -m "Initial commit: todo app with auth, docker, ci/cd"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## 2. Provision AWS infrastructure (EC2 + RDS)

### Option A — Terraform (recommended)

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# edit terraform.tfvars: set my_ip_cidr, key_pair_name, db_password, region

terraform init
terraform plan
terraform apply
```

When it finishes, note the two outputs:
- `ec2_public_ip` — your server's public IP
- `rds_endpoint` — your database's hostname

### Option B — AWS Console (manual)

1. **RDS**: RDS → Create database → PostgreSQL → Free tier / db.t3.micro →
   set master username/password → **do not** make it publicly accessible →
   note the endpoint once created.
2. **Security groups**: create/edit the RDS security group so it only allows
   inbound port 5432 from the EC2 instance's security group.
3. **EC2**: Launch an Amazon Linux 2023 instance (t2.micro) → attach a
   security group allowing inbound 22 (your IP only) and 80 (anywhere) →
   choose your key pair.
4. SSH in and install Docker:
   ```bash
   sudo dnf update -y
   sudo dnf install -y docker
   sudo systemctl enable docker --now
   sudo usermod -aG docker ec2-user
   curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```
   Log out and back in for the docker group change to apply.

---

## 3. Create the database schema

The backend auto-creates its tables on startup (see `backend/db.js`), so
nothing manual is needed here as long as the backend can reach RDS.

---

## 4. Configure GitHub repository secrets

Go to your repo → **Settings → Secrets and variables → Actions** and add:

| Secret name      | Value                                              |
|------------------|-----------------------------------------------------|
| `EC2_HOST`       | Public IP or DNS of your EC2 instance                |
| `EC2_USER`       | `ec2-user` (Amazon Linux default)                     |
| `EC2_SSH_KEY`    | Contents of your EC2 private key (.pem file)          |
| `RDS_HOST`       | RDS endpoint from step 2                              |
| `RDS_USER`       | Database master username                              |
| `RDS_PASSWORD`   | Database master password                              |
| `RDS_DB_NAME`    | `tododb`                                              |
| `JWT_SECRET`     | A long random string (e.g. `openssl rand -hex 32`)    |

Also go to **Settings → Secrets and variables → Actions → Variables** tab
and add a repository variable:

| Variable name  | Value  |
|-----------------|--------|
| `ENABLE_DEPLOY` | `true` |

This flag turns on the `deploy` job in the workflow — it's off by default so
the pipeline doesn't fail on repos that haven't set up EC2 yet.

> The workflow pushes Docker images to **GitHub Container Registry (GHCR)**,
> so no separate Docker Hub account is required. `GITHUB_TOKEN` is provided
> automatically by GitHub Actions.

---

## 5. Make images pullable on EC2 (first time only)

GHCR images are private by default. Either:
- Make the packages public: repo → Packages → select package → Package
  settings → Change visibility → Public, **or**
- Keep them private and let the workflow's `docker login` step (already in
  `ci-cd.yml`) authenticate on the EC2 host before pulling.

---

## 6. Trigger the pipeline

```bash
git add .
git commit -m "Trigger deploy"
git push origin main
```

Watch progress under your repo's **Actions** tab. The workflow will:
1. Build the backend and frontend Docker images
2. Push them to `ghcr.io/<owner>/todo-backend` and `ghcr.io/<owner>/todo-frontend`
3. SSH into your EC2 instance, pull the new images, and restart containers
   using `docker-compose.prod.yml`

---

## 7. Verify

Visit `http://<EC2_PUBLIC_IP>` in your browser — you should see the login
page. Register an account and add a few todos to confirm everything (backend,
RDS, frontend) is wired up correctly.

---

## 8. Security follow-ups for production use

- Put a domain + TLS (e.g. via Let's Encrypt/Certbot or an AWS ALB with ACM)
  in front of the EC2 instance — right now traffic is plain HTTP.
- Rotate the `JWT_SECRET` and DB password if they were ever shared/committed.
- Restrict SSH inbound to your current IP only (Terraform already does this
  via `my_ip_cidr`).
- Consider moving from a single EC2 instance to an Auto Scaling Group /
  ECS/Fargate for real production workloads — this setup is intentionally
  simple for learning/demo purposes.
