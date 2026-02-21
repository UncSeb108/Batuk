
````markdown
# 🎨 Batuk Art Gallery

A full-stack Next.js project for managing and showcasing artworks — complete with real-time gallery updates, artwork uploads, and admin management tools. Built using **Next.js 14**, **MongoDB**, and **Mongoose**.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd Batuk
````

### 2️⃣ Install Dependencies

```bash
npm install
# or
yarn install
```

### 3️⃣ Environment Setup

Create a `.env.local` file in the project root and add the following variables:

```bash
# --- Database Connection ---
MONGODB_URI=mongodb+srv://<name>:<password>@cluster0.yaejql8.mongodb.net/?appName=Cluster0

# --- (Optional) Cloudinary / Image Upload Setup ---
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# --- (Optional) Deployment Config ---
# NEXT_PUBLIC_SITE_URL=https://your-deployment-url.vercel.app
```

🧠 **Note:**

* Ensure MongoDB Atlas access is enabled for your IP or set to `0.0.0.0/0` (for development only).
* Cloudinary config is optional but recommended if you want to upload real images from the admin dashboard.

---

## 🧩 Project Structure

```
/src
 ├── app/
 │   ├── api/
 │   │   ├── gallery/route.ts      # Handles CRUD for artworks
 │   │   ├── messages/route.ts     # Handles contact/message submissions
 │   ├── gallery/                  # Public gallery page with filters
 │   ├── shop/                     # Shop page (cart + product display)
 │   ├── admin/                    # Admin page for uploading artworks
 │   ├── context/CartContext.tsx   # Shopping cart context provider
 │   ├── globals.css               # Global styles
 │   └── layout.tsx / page.tsx     # App entrypoints
 ├── backend/
 │   ├── db/connect.ts             # Mongoose connection handler
 │   ├── models/Artwork.ts         # Artwork schema
 │   ├── models/Message.ts         # Message schema
 │   └── routes/                   # API route logic (gallery, messages)
 ├── public/
 │   ├── images/                   # Static artwork images
 │   ├── data/artworks.json        # Initial artwork data (optional)
 │   └── assets/                   # SVGs, icons, etc.
 └── .env.local                    # Environment variables
```

---

## 🖥️ Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open **[http://localhost:3000](http://localhost:3000)** with your browser.

Changes are hot-reloaded automatically.

---

## 🧪 Building for Production

```bash
npm run build
npm start
```

If your system has low memory (≤ 2GB) and `next build` crashes:

```bash
rm -rf .next node_modules
npm install
NODE_OPTIONS="--max-old-space-size=1024" npm run build
```

---

## 🧰 Features So Far

✅ MongoDB integration with Mongoose
✅ Real-time Gallery updates using SWR
✅ Artwork upload (Admin dashboard)
✅ Cart & Shop pages
✅ Filtered gallery (Available, Sold, Exhibition)
✅ Message form (contact route)
✅ Image rendering with Next/Image

---

## 🧱 Deployment

You can deploy the app easily on **Vercel**:

```bash
vercel
```

Or build for any Node.js host using:

```bash
npm run build
npm start
```

Ensure that your `.env.local` variables are also set in your deployment environment.

---

---

## 👨‍💼 Admin Setup

To log in to the admin dashboard, you need at least one admin account in the database. Here's how to create it:

## 2️⃣ Optional: Admin Creation Script

### 🔒 Security Note

* Keep the **JWT secret** (`JWT_SECRET`) safe; changing it will invalidate all existing sessions.  
* Only trusted users should have admin access.  
* Never store plaintext passwords.

## 👨‍💻 Updated by 

**Paul Maina Ngaruiya**
[GitHub](https://github.com/mainangaruiya) • [Portfolio](https://jnrdev-paulmaina.netlify.app)
Full Stack Developer | Cybersecurity Enthusiast | Artist Platform Builder

---

## 📜 License

This project is licensed under the MIT License.


