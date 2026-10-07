# Futuristic Coders — Coding Education Platform

A clean, production-ready Next.js website for a coding education academy.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17 or later
- npm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Folder Structure

```
futuristic-coders/
├── public/
│   └── images/              # Static assets (add your own images here)
├── src/
│   ├── app/
│   │   ├── layout.js        # Root layout (metadata, global CSS)
│   │   └── page.js          # Home page (assembles all sections)
│   ├── components/
│   │   ├── Navbar/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.module.css
│   │   ├── Hero/
│   │   │   ├── Hero.js
│   │   │   └── Hero.module.css
│   │   ├── Programs/
│   │   │   ├── Programs.js
│   │   │   └── Programs.module.css
│   │   ├── About/
│   │   │   ├── About.js
│   │   │   └── About.module.css
│   │   ├── Stats/
│   │   │   ├── Stats.js
│   │   │   └── Stats.module.css
│   │   └── Footer/
│   │       ├── Footer.js
│   │       └── Footer.module.css
│   └── styles/
│       └── globals.css      # CSS variables, resets, utility classes
├── next.config.js
├── package.json
└── README.md
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary color | `#1a3560` (Deep Blue) |
| Accent color | `#c9952a` (Gold) |
| Heading font | Playfair Display (serif) |
| Body font | Inter (sans-serif) |
| Background | `#f8f9fb` / white |

All design tokens live in `src/styles/globals.css` as CSS custom properties.

---

## ✏️ Customization

- **Logo / Name** — Edit `Navbar.js`
- **Colors / Fonts** — Edit CSS variables in `globals.css`
- **Program cards** — Edit `PROGRAMS` array in `Programs.js`
- **Stats** — Edit `STATS` array in `Stats.js`
- **Contact details** — Edit `Footer.js`
- **Hero image** — Change the `background-image` URL in `Hero.module.css`

---

## 📦 Tech Stack

- **Next.js 14** (App Router)
- **CSS Modules** (scoped per component)
- **Google Fonts** (Playfair Display + Inter)
- **next/image** (optimized images)
- No external UI library dependencies
