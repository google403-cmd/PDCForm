# Personality Development Club (PDC) — PQ · IQ · EQ Assessment

A responsive, high-performance web application designed for the **Personality Development Club (PDC)** of VIT Pune. Built with pure HTML5, Vanilla CSS, and JavaScript, ready for direct deployment on **GitHub Pages**, **Vercel**, or any static hosting platform with a **Supabase PostgreSQL** cloud database backend.

---

## 🌟 Key Features

- **PDC Visual Identity**: Designed around the official PDC logo palette: vibrant PDC Coral (`#F96340`), Deep Obsidian (`#11141A`), and Warm Amber accents (`#D97706`).
- **Comprehensive Assessment Flow**: 20 carefully calibrated questions covering:
  - **Personality Quotient (PQ)**: Character, social confidence, and communication (Max 35)
  - **Intellectual Quotient (IQ)**: Logic, pattern recognition, and critical thinking (Max 30)
  - **Emotional Quotient (EQ)**: Self-awareness, empathy, and emotional poise (Max 35)
  - **Total**: 100 Marks
- **Actionable & Personalized Report**: Concise snapshot detailing demonstrated strengths, growth areas, specific PDC developmental activities, and concrete ways PDC elevates each quality.
- **Rich Activity Showcase**: Large, high-visibility photographs highlighting key PDC programs:
  1. Software Training Workshops (STWs) at IIT Bombay
  2. Personality Development Workshops (PDWs)
  3. Personalized Mentor Meets
  4. Edutainment Outings & Camps
  5. Timeless Wisdom Sessions
- **Unified WhatsApp Community CTA**: Single, prominent **"Join WhatsApp Community"** call to action with no gender segregation.
- **Dedicated Kondhwa Campus Pathway**: Standalone `kondhwa.html` portal featuring dedicated Kondhwa Club branding and independent quiz routing.
- **Supabase Backend**: Submits to `confirmation_stst` and `pdc_bibwewadi_submissions` with instant deduplication and offline fallback.

---

## 📁 Repository Structure

```
.
├── index.html              # Main assessment page with multi-step test (Bibwewadi)
├── kondhwa.html            # Dedicated Kondhwa Campus assessment route
├── result.html             # Actionable score report, activity gallery & community CTA
├── firestore.rules         # Production Firestore security rules for pdc_test_submissions
├── vercel.json             # Vercel deployment headers & cache-control policies
├── .env.example            # Environment variables template for Firebase & URLs
├── package.json            # Scripts & dependencies
├── assets/
│   ├── pdc-logo.png        # Official PDC square logo
│   └── kondhwa-logo.svg    # Official Kondhwa Club emblem
├── Stories/
│   ├── PDC Banner.png      # Official activities header banner
│   ├── pdclogo1.png        # PDC Logo asset
│   ├── iitstw.png          # STW at IIT Bombay
│   ├── pdw.png             # Personality Development Workshops
│   ├── mmc.png             # Personalized Mentor Meets
│   ├── camps.png           # Edutainment Outings
│   └── wisdom.png          # Timeless Wisdom Sessions
├── css/
│   └── styles.css          # Design system, PDC tokens, responsive layouts
├── js/
│   ├── content.js          # Master configuration (copy, scoring, questions, links)
│   ├── firebase-config.js  # PDC Firebase credentials & Firestore connector
│   ├── security.js         # Checksum signature & session encryption
│   └── app.js              # Multi-step state, validation & submission logic
└── test/
    ├── validate-assessment.js         # Question & structure validation suite
    └── test-scoring-and-submission.js # Scoring engine & payload schema tests
```

---

## 🚀 Quick Start (Running Locally)

Because this is a pure static web application, you can run it with any local server:

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: Node `npx serve`
```bash
npx serve .
```

### Option 3: VS Code / IDE Live Server
Right-click `index.html` and select **"Open with Live Server"**.

---

## 🧪 Running Automated Tests

```bash
npm test
```
Validates question structures, maximum marks (PQ: 35, IQ: 30, EQ: 35, Total: 100), option keys, and payload schema constraints.

---

## ⚙️ Configuration Guide

All club configuration is centralized in [`js/content.js`](file:///c:/Users/ADMIN/Downloads/PDC/DhruvaClub/js/content.js):

- **PDC WhatsApp Community URL**: Update `whatsappLinks.COMMUNITY_URL`.
- **Kondhwa Quiz URL**: Update `campusAccess.KONDHWA_QUIZ_URL`.
- **Firebase Project**: Update `firebase` in `js/content.js` or via environment variables in `js/firebase-config.js`.

---

## 📄 License & Attribution

&copy; Personality Development Club (PDC) • VIT Pune. All rights reserved.
Character | Competence | Culture
