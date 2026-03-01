# Design Sprint — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted instance)
- npm / pnpm / yarn

---

## 1. Clone & Install

```bash
cd "design sprint"
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/design_sprint?schema=public"
JWT_SECRET="generate-with: openssl rand -base64 32"
JWT_EXPIRES_IN="7d"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SEED_ADMIN_EMAIL="admin@techclub.edu"
SEED_ADMIN_PASSWORD="Admin@123"
```

---

## 3. Database Setup

```bash
# Create and apply the schema
npm run db:push

# OR use migrations (recommended for production)
npm run db:migrate

# Seed with sample data
npm run db:seed
```

After seeding, you'll have:
- **Admin:** `admin@techclub.edu` / `Admin@123`
- **Members:** `alice@techclub.edu` (and 7 others) / `Member@123`
- **1 Sprint Session** in VOTING status with 10 ideas, votes, and comments

---

## 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 5. Production Build

```bash
npm run build
npm run start
```

---

## Key URLs

| Route         | Description                           |
|---------------|---------------------------------------|
| `/`           | Landing page with sprint overview     |
| `/login`      | Sign in                               |
| `/register`   | Create account                        |
| `/dashboard`  | Idea list, submission, voting         |
| `/matrix`     | Drag-and-drop Impact × Feasibility    |
| `/results`    | Top ideas, selected events, analytics |
| `/admin`      | Sprint management (admin only)        |

---

## API Routes

| Method | Path                          | Auth   | Description               |
|--------|-------------------------------|--------|---------------------------|
| POST   | /api/auth/register            | -      | Register new user         |
| POST   | /api/auth/login               | -      | Login, get JWT cookie     |
| POST   | /api/auth/logout              | -      | Clear session cookie      |
| GET    | /api/auth/me                  | ✓      | Current user info         |
| GET    | /api/sprint                   | ✓      | List sprint sessions      |
| POST   | /api/sprint                   | Admin  | Create sprint session     |
| PATCH  | /api/sprint/[id]              | Admin  | Update sprint status      |
| GET    | /api/ideas                    | ✓      | List ideas (with filters) |
| POST   | /api/ideas                    | ✓      | Create idea               |
| PATCH  | /api/ideas/[id]               | Owner/Admin | Update idea          |
| DELETE | /api/ideas/[id]               | Admin  | Delete idea               |
| POST   | /api/ideas/[id]/vote          | ✓      | Cast vote                 |
| DELETE | /api/ideas/[id]/vote          | ✓      | Remove vote               |
| GET    | /api/ideas/[id]/comments      | ✓      | List comments             |
| POST   | /api/ideas/[id]/comments      | ✓      | Post comment              |
| PATCH  | /api/ideas/[id]/matrix        | ✓      | Update matrix scores      |
| GET    | /api/admin                    | Admin  | Admin summary             |
| PATCH  | /api/admin/mark-final         | Admin  | Change idea status        |
| GET    | /api/admin/export             | Admin  | Export ideas as CSV       |
| GET    | /api/analytics                | ✓      | Analytics data            |

---

## Sprint Lifecycle

```
DRAFT → ACTIVE → VOTING → CLOSED
```

- **DRAFT**: Admin created, not yet open
- **ACTIVE**: Members can submit ideas
- **VOTING**: Idea submission closed, voting open (1 vote per idea per user)
- **CLOSED**: Sprint concluded, results visible

---

## Database Reset

```bash
npm run db:reset   # drops all data + re-seeds
```
