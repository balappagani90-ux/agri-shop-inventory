# AgriShop - Agriculture Inventory & Sales Management System

A complete responsive web application for managing daily agricultural stock, sales, purchases, transfers across 3 storerooms, and generating daily/monthly/yearly reports.

## 🚀 Live Demo Deployment

This application is built with standard HTML5, CSS3, and JavaScript. It runs 100% free on **GitHub Pages**, **Vercel**, or **Netlify**.

### 📱 Features
- 🏬 **3 Storerooms Management** (Main Store, Store Room 2, Store Room 3)
- 👥 **User Roles** (Admin & Staff permissions)
- 📊 **Executive Dashboard** with Chart.js 7-day sales trends & stock distributions
- 📝 **Daily Stock Update Form** with editable Opening Stock and auto Closing Stock calculations
- 🛒 **Sales Management** with automatic stock deduction and invoice printing
- 📥 **Stock Purchases** with batch numbers and expiry tracking
- 🔄 **Stock Transfer** between any 2 storerooms
- ⚠️ **Stock Write-offs** for damaged/expired items
- 🖨️ **Printable Sales Reports** (Daily, Monthly, Yearly) and CSV exports
- 📜 **Complete Audit History Ledger**

## 🌐 Deploy to GitHub Pages (100% Free)

1. Create a new repository on [GitHub](https://github.com/new) named `agri-shop-inventory`.
2. Upload all files from this folder (`index.html`, `style.css`, `app.js`, `db.js`, `supabase-schema.sql`, `README.md`).
3. Go to **Repository Settings** -> **Pages**.
4. Under **Build and deployment** -> **Branch**, select `main` (or `master`) branch and click **Save**.
5. Your site will be live at: `https://<your-username>.github.io/agri-shop-inventory/`

## 💾 How Free Data Persistence Works

1. **Browser Offline Storage (Default - 100% Free)**:
   - All added products, sales, stock updates, and adjustments are saved inside your web browser's `localStorage`.
   - Requires zero servers, zero monthly fees, and works offline.

2. **Supabase Cloud Database (Optional - 100% Free Tier)**:
   - If you want your stock & sales data synced in real-time across multiple phones, laptops, and staff accounts:
   - Create a free account at [Supabase.com](https://supabase.com).
   - Create a project and run the included [`supabase-schema.sql`](supabase-schema.sql) script in the SQL Editor.
   - Copy your Supabase URL & Anon Key into **Settings** in the app.
