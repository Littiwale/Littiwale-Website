# 🍛 Litti Wale Barbil — High-Conversion Food Ordering Platform

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://littiwale-barbil.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Location: Barbil](https://img.shields.io/badge/Location-Barbil,%20Odisha-success?logo=google-maps)](https://maps.google.com/maps?q=22.1152751,85.3871145)

> **"The Soul of Bihar, Delivered."**  
> A state-of-the-art, high-conversion web application designed for **Litti Wale Barbil**, seamlessly powering both their **Cloud Kitchen** and **Physical Outlet** operations.

---

## 🌟 Platform Highlights

### 1. 🏪 Dual-Location Architecture & Smart Switcher
* **☁️ Cloud Kitchen Mode:** Operates from **9:00 AM to 11:00 PM**, serving the complete catalog of authentic Bihari dishes, North/South Indian meals, snacks, beverages, and both Veg & Non-Veg options.
* **🏪 Physical Outlet Mode:** Operates from **8:00 AM to 10:00 PM** (Sunday Closed). Automatically enforces a **100% Pure Vegetarian** catalog, hides non-veg filters, and highlights dine-in/takeaway availability.
* **Dynamic Location Toggling:** Customers can switch locations seamlessly via the top navbar, location picker modals, or sticky banners on the menu page.

### 2. 🏷️ Premium Visual Availability Badges
To ensure 100% customer transparency, every single menu card (in Best Sellers and Full Menu) features a dynamic visual tag indicating exact availability:
* `☁️ CLOUD KITCHEN` (Golden Yellow Glow)
* `🏪 PHYSICAL OUTLET` (Fresh Green Glow)
* `☁️ CLOUD + 🏪 OUTLET` (Electric Blue Glow)

### 3. 🚀 Conversion-Optimized Menu & Smart Deals
* **Strategic Category Hierarchy:** High-margin combos, Feasts, Meal for One, and Rice Bowl Combos are strategically prioritized at the top of the catalog, preventing customer drop-off.
* **Smart Deals Engine:** Features a dynamic "Craziest Deals of the Hour" section that rotates top promotional offers to encourage quick grabs.
* **Frictionless WhatsApp Checkout:** Generates a beautifully formatted order summary sent directly to the restaurant's WhatsApp for instant confirmation.

### 4. 🔍 Advanced Local SEO & Schemas
* **Structured Data:** Injects complete Schema.org JSON-LD definitions for `WebSite` and dual `Restaurant` locations (Cloud Kitchen & Physical Outlet) directly into `<head>`.
* **Crawlability:** Fully optimized `sitemap.xml` with proper priority weighting to dominate local search queries (e.g., *"best restaurant in barbil"*, *"litti chokha near me"*).
* **OpenGraph Preview:** Fully branded social sharing cards for WhatsApp, Facebook, and Instagram previews.

---

## 🏗️ Architecture & Data Pipeline (Excel ETL)

The platform is powered by an elegant, Excel-driven ETL (Extract, Transform, Load) pipeline. This allows non-technical staff to manage pricing, inventory, and imagery directly via spreadsheets without touching the codebase.

```
┌────────────────────────────────────────────────────────┐
│                   Excel Governance                     │
│    data/menu.xlsx       &     data/imagemapping.xlsx   │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼ (Run ETL Script)
                 python menu/parse_menu.py
                            │
                            ├─► Optimizes & converts images to WebP
                            ├─► Standardizes square aspect ratios
                            │
                            ▼ (Generates JSON Artifacts)
     data/menu.json       &     data/imagemap.json
                            │
                            ▼ (Client-Side Rendering)
                 js/main.js & menu.html
```

### 🛠️ How to Update the Menu or Imagery
1. **Modify Data:** Open `data/menu.xlsx` to add new items, update prices, or toggle stock status (`TRUE`/`FALSE`). Open `data/imagemapping.xlsx` to associate item IDs with image filenames.
2. **Add Raw Images:** Place any new high-resolution images into the `images/raw/` directory.
3. **Run Build Script:** Execute the Python ETL script from the project root:
   ```bash
   python menu/parse_menu.py
   ```
4. **Deploy:** Commit the updated JSON files and WebP images, then push to Vercel.

---

## 📁 Project Directory Structure

```text
litti-wale/
├── index.html                 # Main landing page (Hero, Best Sellers, Plans, FAQ)
├── menu.html                  # Full interactive menu catalog with search & filters
├── checkout.html              # Order review & WhatsApp checkout generation
├── sitemap.xml                # SEO sitemap for Google Search Console
├── README.md                  # Project documentation
│
├── css/
│   └── style.css              # Core responsive stylesheet & design tokens
│
├── js/
│   ├── main.js                # Core cart logic, menu rendering, badges & deals engine
│   ├── location-picker.js     # Modal logic, sticky outlet bar & location state
│   └── restaurant-timing.js   # Operating hours enforcement & closed overlays
│
├── data/
│   ├── menu.xlsx              # Master inventory spreadsheet
│   ├── imagemapping.xlsx      # Master image mapping spreadsheet
│   ├── menu.json              # Generated frontend catalog artifact
│   └── imagemap.json          # Generated frontend image map artifact
│
├── menu/
│   └── parse_menu.py          # Python ETL build script (Pillow/Pandas required)
│
└── images/                    # Optimized WebP assets, logos, and UI graphics
```

---

## 📱 Mobile Responsiveness & UI/UX
The application is built with a mobile-first philosophy using modern CSS Flexbox and Grid layouts (`auto-fit`, `flex-wrap`). It delivers a flawless, app-like experience across all smartphone viewports, ensuring zero horizontal scrolling and 100% touch-friendly Call-to-Actions.

---

## 📞 Support & Contact
* **Cloud Kitchen Hotline:** +91 63706 80744 (Ward No. 7, Punjabi Para, Barbil)
* **Physical Outlet Hotline:** +91 63706 80744 (Near Barbil Court, Back Side of Rabisons Mall)
* **Development Agency:** [BrandNest](https://brandnestagency.vercel.app/)
