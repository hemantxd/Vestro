# Vestro Frontend Roadmap (V1)

## Vision

Build Vestro as a social platform first.

The goal of V1 is to create an engaging community where users can:

* Create posts
* Follow users
* Comment and interact
* Discover content
* Build a profile

Trading-specific features (watchlists, portfolios, stock discussions, market feeds, AI insights) will be added later after the social layer is validated.

---

# Tech Stack

## Core

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS v4

## UI

* shadcn/ui
* lucide-react
* framer-motion

## State Management

### Server State

* TanStack Query

### Client State

* Zustand (UI state only)

## Forms

* react-hook-form
* zod
* @hookform/resolvers

## Networking

* ky (preferred) or fetch

## Media

* react-dropzone

## Future

* Native WebSocket (`ws`)
* React Native App
* Trading Features

---

# Project Structure

```txt
src/
├── app/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── posts/
│   ├── comments/
│   ├── follows/
│   ├── notifications/
│   └── search/
│
├── components/
│   └── ui/
│
├── lib/
│   ├── api/
│   ├── query/
│   └── utils/
│
├── providers/
│
├── store/
│
├── hooks/
│
├── types/
│
├── constants/
│
└── assets/
```

---

# Development Phases

---

# Phase 1 — Foundation

## Goal

Create a professional landing page and authentication system.

### Features

#### Landing Page

* Hero section
* Product introduction
* Features section
* Community section
* CTA section
* Footer

#### Authentication

* Register
* Login
* Google Login
* JWT Authentication
* Protected Routes
* Logout

#### User System

* Current User Fetch
* User Session Persistence
* Auth Guards

### Pages

```txt
/
├── Landing Page

/login
├── Login Page

/register
├── Register Page
```

### Deliverables

* Landing page complete
* Login/Register complete
* Google login working
* JWT authentication working
* Route protection working

---

# Phase 2 — User Profiles

## Goal

Allow users to create identities.

### Features

* Profile Page
* Edit Profile
* Avatar Upload
* Cover Banner Upload
* Bio
* Username

### Pages

```txt
/profile/[username]
/settings/profile
```

---

# Phase 3 — Posts

## Goal

Users can create content.

### Features

* Create Post
* Delete Post
* Edit Post
* Feed
* Single Post Page
* Media Upload

### Pages

```txt
/
/post/[id]
```

---

# Phase 4 — Comments & Likes

## Goal

Create engagement.

### Features

* Like Post
* Unlike Post
* Comment
* Delete Comment
* Nested Replies

### Pages

```txt
/post/[id]
```

---

# Phase 5 — Follow System

## Goal

Create social connections.

### Features

* Follow User
* Unfollow User
* Followers List
* Following List
* Suggested Users

### Pages

```txt
/profile/[username]
```

---

# Phase 6 — Discovery

## Goal

Help users find people and content.

### Features

* Search Users
* Search Posts
* Trending Posts

### Pages

```txt
/explore
/search
```

---

# Phase 7 — Notifications

## Goal

Increase retention.

### Features

* Follow Notifications
* Like Notifications
* Comment Notifications
* Unread Count

### Implementation

Polling every 30–60 seconds.

No realtime yet.

### Pages

```txt
/notifications
```

---

# Phase 8 — Media Experience

## Goal

Improve content quality.

### Features

* Image Uploads
* Video Uploads
* Media Gallery
* Media Viewer

---

# Phase 9 — Realtime

## Goal

Live user interactions.

### Features

* Live Notifications
* Live Comments
* Live Chat
* Typing Indicators

### Technology

```txt
ws (Native WebSocket)
```

---

# Phase 10 — Trading Features

Build only after the social platform gains traction.

### Future Modules

```txt
features/
├── portfolios/
├── watchlists/
├── stock-search/
├── stock-discussions/
├── market-feed/
├── trade-ideas/
```

### Future Features

* Stock Pages
* Watchlists
* Portfolio Tracking
* AI Insights
* Sentiment Analysis
* Investor Leaderboards

---

# Success Criteria

Before adding trading features, Vestro should support:

✅ Landing Page

✅ Authentication

✅ Profiles

✅ Posts

✅ Comments

✅ Likes

✅ Follow System

✅ Discovery

✅ Notifications

✅ Media Uploads

Only after these are complete should development move toward stock-specific functionality.
