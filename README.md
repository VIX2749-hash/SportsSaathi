# Move Together — Sports Partner Matching Platform

> **"Find your people. Show up. Keep moving."**

A modern, responsive, full-stack web application designed to connect individuals seeking sports partners, workout accountability, and local community sessions. Inspired by an athletic-editorial design language (deep burgundy/wine `#201215`, warm ivory `#FAF7F2`, and high-energy lime accent `#CCFF00`, with bold condensed athletic typography).

---

## ⚡ Key Highlights & Completed Workflows

1. **Athletic-Editorial Visual Identity**:
   - Oversized condensed display headlines paired with geometric sans body text.
   - Deep burgundy/wine ground surfaces with asymmetric folder-tab cards and lime neon accents.
   - High-contrast, clean responsive design on mobile and desktop viewports.

2. **Authentication & 5-Step Guided Onboarding**:
   - Register, login, token persistence, and quick pre-seeded athlete demo logins.
   - Guided onboarding covering basic profile details, multi-sport discipline selection, experience levels (Beginner $\to$ Competitive), weekly day & time slot availabilities, and customizable search radius.

3. **Sports Partner Matching with Explainable Compatibility**:
   - Explainable compatibility score calculating exact weighted alignment:
     - **Sports Overlap (40%)**
     - **Weekly Schedule Overlap (30%)**
     - **Skill Level & Pace Alignment (20%)**
     - **Geographic Proximity (10%)**
   - Clickable compatibility factors explaining why users match.
   - Connection workflow (Send $\to$ Accept/Decline $\to$ Direct Messaging $\to$ Block).

4. **Activity Catalog & Safe Discovery**:
   - Instant search and filtering by sport, experience level, intensity, and date.
   - Real-time capacity safeguards that prevent double-joining or overbooking.
   - **Two-tier location disclosure**: General public park or court shown publicly; exact meetup point / pin revealed exclusively to confirmed participants.

5. **Activity Discussion & Host Attendance Tracking**:
   - Session group discussion board for questions on gear and logistics.
   - Host attendance check-in workflow rewarding athletes with weekly streak counts.

6. **1-on-1 Direct Messaging & Safety Hub**:
   - Direct messaging between accepted connections with unread counters.
   - Built-in Safety Hub explaining public venue requirements, zero-tolerance romance/dating policies, fast reporting, and blocking tools.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### 1. Installation

```bash
# In server directory:
cd server
npm install
npx prisma generate
npx prisma db push
npm run seed     # Pre-populates realistic athletes & sports activities

# In client directory:
cd ../client
npm install
```

### 2. Running Locally

**Start Backend (Port 5000):**
```bash
cd server
npm run dev
```

**Start Frontend (Port 5173):**
```bash
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🏃 Pre-Seeded Demo Athletes (Password: `password123`)

| Athlete | Email | Sports | Specialization |
| :--- | :--- | :--- | :--- |
| **Alex Rivera** | `alex.rivera@example.com` | Running, Tennis | Marathon pace training & rally doubles |
| **Sarah Chen** | `sarah.chen@example.com` | Badminton, Running | Advanced badminton club player & trail 10ks |
| **Marcus Vance** | `marcus.vance@example.com` | Football, Gym | 7v7 soccer organizer & strength conditioning |
| **Elena Rostova** | `elena.rostova@example.com` | Running, Yoga | Beginner 5K runner & flexibility |
| **David Kim** | `david.kim@example.com` | Cycling, Hiking | Road bike pacelines & Cascade hikes |

---

## 🛠️ Tech Stack Architecture

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, JWT, bcryptjs, Zod.
- **Database**: SQLite (default, zero configuration required; fully Postgres-compatible via `schema.prisma`).
