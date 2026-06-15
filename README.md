# Repairo — Admin Panel

Repairo Admin Panel is a Next.js 15 web application for platform administrators to manage users, shops, leads, payments, and analytics in one place.

---

## Tech Stack

- Next.js 15, TypeScript
- Tailwind CSS, shadcn/ui
- Axios with refresh interceptor
- Next.js API Routes as proxy layer
- httpOnly cookies for token storage
- Recharts (analytics charts)

---

## Roles

Only ADMIN role can access this panel. Authentication is handled via email + password, tokens stored in httpOnly cookies — never in localStorage.

---

## System Architecture

```mermaid
graph TD
    Browser[Admin Browser] -->|HTTPS| NextJS[Next.js 15]
    NextJS -->|Proxy API Routes| Backend[Spring Boot Backend]
    NextJS -->|httpOnly Cookies| Tokens[Access + Refresh Tokens]
    Backend -->|Data| PostgreSQL[(PostgreSQL)]
    Backend -->|Cache| Redis[(Redis)]
```

---

## Auth Flow

```mermaid
sequenceDiagram
    participant Admin
    participant NextJS as Next.js API Route
    participant BE as Spring Boot Backend

    Admin->>NextJS: POST /api/admin/login (email, password)
    NextJS->>BE: Forward credentials
    BE->>NextJS: Access token + Refresh token
    NextJS->>Admin: Set httpOnly cookies (access=900s, refresh=604800s)

    Admin->>NextJS: GET /api/admin/dashboard/stats
    NextJS->>BE: Forward with Authorization header
    BE->>NextJS: Stats data
    NextJS->>Admin: Response

    Note over Admin,NextJS: Access token expires

    Admin->>NextJS: Any protected request
    NextJS->>BE: POST /api/admin/refresh
    BE->>NextJS: New access token
    NextJS->>Admin: Retry original request
```

---

## Token Refresh Flow (Axios Interceptor)

```mermaid
sequenceDiagram
    participant Axios
    participant NextJS as Next.js API Route
    participant BE as Backend

    Axios->>NextJS: Any request
    NextJS->>BE: Forward
    BE->>NextJS: 401 Unauthorized

    Note over Axios: Refresh lock acquired
    Note over Axios: Concurrent 401s queued

    Axios->>NextJS: POST /api/admin/refresh
    NextJS->>BE: Refresh token from cookie
    BE->>NextJS: New access token
    NextJS->>Axios: Token updated

    Note over Axios: Queue flushed, all requests retried

    alt Refresh also fails
        Axios->>Browser: Redirect to /login
    end
```

---

## Shop Approval Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Panel as Admin Panel
    participant BE as Backend
    participant S3

    Admin->>Panel: Open /dashboard/shops
    Panel->>BE: GET /admin/shops?status=PENDING
    BE->>Panel: Pending shops list

    Admin->>Panel: Click shop row
    Panel->>BE: GET /admin/shops/{id}
    BE->>Panel: Shop detail + doc URLs

    Admin->>S3: View CNIC / business doc (presigned URL)

    alt Approve
        Admin->>Panel: Click Approve
        Panel->>BE: POST /admin/shops/{id}/approve
        BE->>Panel: Shop status = APPROVED
        BE-->>ShopOwner: FCM notification sent
    else Reject
        Admin->>Panel: Click Reject + reason
        Panel->>BE: POST /admin/shops/{id}/reject
        BE->>Panel: Shop status = REJECTED
        BE-->>ShopOwner: FCM notification sent
    end
```

---

## Analytics Flow

```mermaid
sequenceDiagram
    participant Admin
    participant Panel as Admin Panel
    participant BE as Backend

    Admin->>Panel: Open /dashboard/analytics
    Admin->>Panel: Select period (7D / 30D / 12M / Custom)

    Panel->>BE: GET /admin/analytics?period=7D
    BE->>Panel: Lead trends, status distribution, top shops, platform stats

    Note over Panel: Custom date range selected
    Note over Panel: Previous period auto-calculated (same duration)

    Panel->>Panel: Render line chart (lead trends)
    Panel->>Panel: Render donut chart (status distribution)
    Panel->>Panel: Render top shops table

    Admin->>Panel: Click Export CSV
    Panel->>BE: GET /admin/analytics/export?period=7D
    BE->>Panel: CSV file download
```

---

## Prerequisites

- Node.js 18+
- Running Repairo Spring Boot backend

---

## Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

All API calls go through Next.js API routes — backend URL is never exposed to the browser.

---

## How to Run

```bash
npm install
npm run dev
```

Panel runs on `http://localhost:3000`

Middleware automatically protects all `/dashboard/*` routes. Unauthenticated users are redirected to `/login`.

---

## Pages Overview

**`/login`** — Admin email + password login

**`/dashboard`** — Stats cards, recent pending shops, recent activity feed

**`/dashboard/shops`** — Tabs for Pending, Approved, Rejected shops. Search, pagination, slide-over detail drawer with document viewer and approve/reject actions

**`/dashboard/leads`** — Lead list with status filter, search (Enter key), pagination, CSV export. Lead detail page with images lightbox, vehicle info, accepted quote card

**`/dashboard/users`** — Tabs for All, Car Owners, Shop Owners, Admin. User detail drawer with stats, recent activity, block/unblock actions

**`/dashboard/activity`** — Paginated activity log, filter by activity type

**`/dashboard/analytics`** — Period selector, stats cards, lead trend line chart, status distribution donut chart, top shops table, CSV export

---

## Proxy API Routes

All backend calls go through Next.js API routes. Browser never talks to Spring Boot directly.

```
POST   /api/admin/login
POST   /api/admin/refresh
GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/recent-shops
GET    /api/admin/activity/recent
GET    /api/admin/activity
GET    /api/admin/shops
GET    /api/admin/shops/counts
GET    /api/admin/shops/{id}
GET    /api/admin/users
GET    /api/admin/users/counts
GET    /api/admin/users/{id}
POST   /api/admin/users/{id}/block
POST   /api/admin/users/{id}/unblock
GET    /api/admin/leads
GET    /api/admin/leads/export
GET    /api/admin/leads/{id}
GET    /api/admin/analytics
GET    /api/admin/analytics/export
```

---

## Key Decisions

- Admin tokens stored in httpOnly cookies, not localStorage — XSS safe
- All backend calls proxied through Next.js API routes — backend URL never exposed to browser
- Axios refresh lock implemented — concurrent 401s are queued, not duplicated
- Search triggers on Enter key only — no debounce needed
- CLOSED lead status displayed as COMPLETED on frontend
- Analytics custom date range automatically calculates previous period of same duration
- Lead trend grouping is daily for ranges up to 60 days, monthly for ranges above 60 days
- Active Shops stat counts only APPROVED + is_active shops
- Monthly revenue and GMV hardcoded (payments are mocked)
- Shop rating column kept as placeholder for future module
