# DevCenterPoint (Modernized Rebuild: React 19 + Laravel 11)

A complete, high-fidelity rebuild of the DevCenterPoint marketing & CMS platform, modernizing the stack from Node.js/Express + EJS into **Frontend in React 19 (Inertia.js)** and **Backend in Laravel 11**.

---

## ⚡ Architecture & Tech Stack

- **Backend Framework:** Laravel 11 (PHP 8.2+)
- **Frontend Layer:** React 19 via Inertia.js v2
- **Asset Pipeline:** Vite 8 + React Plugin + Tailwind/CSS Modules
- **Interactive 3D & Motion:**
  - Three.js (Procedural particle field, lifecycle-safe with explicit cleanup)
  - Spline Runtime (`@splinetool/runtime`)
  - GSAP & Lenis smooth scrolling
- **Styling:** Curated dark/light design token system matching original branding (`tokens.css`, `base.css`, `pages.css`, `select.css`, `admin.css`)
- **Database Support:**
  - **SQLite** (configured by default for zero-setup, self-contained running)
  - **MySQL** (schema is 100% compatible; switchable with one line in `.env`)

---

## 🚀 Getting Started

### 1. Prerequisites
- PHP 8.2+ with `pdo_sqlite` or `pdo_mysql`
- Composer 2+
- Node.js 18+ and npm

### 2. Quick Run (One-Command Dev Server)

From inside the `dcp-rebuild` directory:

```bash
# Terminal 1: Laravel Backend Server
php artisan serve

# Terminal 2: Vite Dev Server (HMR)
npm run dev
```

The application will be accessible at:
- **Public Site:** `http://127.0.0.1:8000`
- **Admin Dashboard:** `http://127.0.0.1:8000/admin`

---

## 🔐 Default Admin Credentials

- **Email:** `admin@devcenterpoint.com`
- **Password:** `admin123456`

---

## 📦 What Was Rebuilt & Replicated

### Public Client Surface (100% Visual & Behavioral Parity)
- **Home (`/`):** 8 storytelling chapters, interactive cost-curve comparison, live particle canvas, credibility statistics, client testimonials, and discipline selector.
- **Work (`/work`, `/work/{slug}`):** Case study index with sector filtering, detailed metrics, tech stack badges, quotes, and related deliverables.
- **Services (`/services`, `/services/{slug}`):** Disciplines breakdown, deliverables checklist, 4-phase agile delivery timeline, and FAQs.
- **Insights (`/insights`, `/insights/{slug}`):** Engineering blog with tag filters, markdown reader with server-rendered CommonMark, reading time calculation, and author cards.
- **Changelog / Updates (`/updates`):** Interactive timeline with category filters (Platform, Security, Architecture, Performance).
- **Interactive Scope Estimator (`/contact`):** Real-time timeline, cost estimation, squad calculator, and instant injection into enquiry messages.
- **Operational Status (`/status`):** Real-time latency, uptime, and database telemetry monitoring.
- **Global Command Palette (`Cmd+K` / `Ctrl+K`):** Instant keyboard modal querying `/api/search` across services, projects, articles, and changelogs.
- **Custom Cursor & Theme Switcher:** Smooth lerping magnetic cursor and dark/light mode toggle persistent in `localStorage`.
- **SEO & Feeds:** XML Sitemap (`/sitemap.xml`) and RSS 2.0 Feed (`/rss.xml`).

### Admin CMS Surface (Protected by Laravel Session Auth)
- **Dashboard (`/admin`):** Metric counters, recent unread enquiries, quick action shortcuts.
- **Submissions (`/admin/submissions`):** Inbox for contact enquiries with read/unread toggle and archiving.
- **Case Studies (`/admin/cases`):** Full CRUD for case studies with client visibility controls (named vs anonymized).
- **Insights / Articles (`/admin/posts`):** Full markdown authoring for technical publications.
- **Updates (`/admin/updates`):** Changelog versioning and release notes.
- **Disciplines / Services (`/admin/services`):** Service offerings management.
- **Pages (`/admin/pages`):** Generic markdown pages (About, Terms, Privacy).
- **Team (`/admin/team`):** Engineering squad and leadership profiles.
- **Testimonials (`/admin/testimonials`):** Client review management with live preview.
- **FAQs (`/admin/faqs`):** Frequently asked questions organizer.
- **Media Library (`/admin/media`):** File upload and asset storage.
- **Navigation (`/admin/nav`):** Header and footer navigation link management.
- **Global Settings (`/admin/settings`):** Global organization metadata, social links, and SEO defaults.

---

## 🧪 Automated Testing

To run the automated PHPUnit test suite covering all public routes, search API, contact submission, and admin authorization:

```bash
php artisan test
```
