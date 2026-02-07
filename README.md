# 🌿 Gampahin Husmak - Green Gampaha Initiative

Gampahin Husmak is a state-of-the-art Progressive Web App (PWA) designed to restore and monitor the green cover of the Gampaha District. This platform empowers citizens to plant trees, track their growth, and build a sustainable future together.

![Gampahin Husmak Hero](frontend/public/logo.png)

## 🚀 Key Features

### 🌳 Tree Monitoring & Management

- **GPS Registration**: Record tree planting locations with high-precision GPS coordinates.
- **Mandatory Photo Documentation**: Every planting and progress update requires a photo for audit and history tracking.
- **Growth Timeline**: Track tree height, health status, and growth history through visual timelines.
- **QR Code Integration**: (Upcoming) Each tree gets a unique digital identity.

### 👥 Community Engagement

- **Leaderboard**: Recognizing the top environmental champions in Gampaha with fair tie-breaking logic.
- **Events Platform**: Organize, discover, and join community planting events.
- **Shared Gallery**: Explore the district's impact through a curated photo feed of community efforts.
- **Achievement System**: Earn badges and certificates for contributing to the green mission.

### 🛡️ Administrative Control

- **Role-Based Access**: Dedicated panels for regular volunteers, admins, and super admins.
- **Verification System**: All new trees and user registrations are reviewed by administrators for quality control.
- **Issue Resolution**: Direct communication channel between users and district admins for tree care support.
- **Real-time Analytics**: Monitoring of district-wide statistics including CO2 offset and survival rates.

### 📱 Modern Tech Stack & Experience

- **PWA Ready**: Install the app on your home screen for a native experience.
- **Offline Support**: Optimized caching for smooth performance in areas with weak connectivity.
- **Bilingual Support**: Full English and Sinhala (සිංහල) language integration.
- **Weather Alerts**: Integrated environmental monitoring and alerts for tree care.

---

## 🛠️ Technology Stack

| Layer         | Technologies                                                        |
| :------------ | :------------------------------------------------------------------ |
| **Frontend**  | React 19, TypeScript, Vite, TanStack Query, Radix UI, Framer Motion |
| **Styling**   | Tailwind CSS 4, Lucide Icons                                        |
| **Backend**   | Node.js, Express 5, TypeScript, express-session                     |
| **Database**  | MongoDB Atlas, Mongoose ODM                                         |
| **Utilities** | Zod (Validation), bcryptjs (Hashing), ImgBB (Image Hosting)         |

---

## 🏁 Getting Started

### 1. Prerequisites

- Node.js v18.x or higher
- A MongoDB Atlas database instance
- An ImgBB API Key for photo uploads

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_mongodb_connection_string
SESSION_SECRET=your_secure_secret_key
VITE_IMGBB_API_KEY=your_imgbb_api_key
NODE_ENV=development
PORT=5000
```

### 3. Installation

```bash
# Install dependencies
npm install

# Clear old data and seed new Super Admin
npx tsx script/reset-db.ts

# Start development server
npm run dev
```

### 4. Admin Credentials

The database reset script creates the following default login:

- **Username**: `vishwamihi`
- **Email**: `vishwamihi@gmail.com`
- **Password**: `Vishwa@1214%`
- **Role**: Super Admin

---

## 📁 Project Structure

```bash
├── backend/            # Express API, Models, and Middlewares
├── frontend/           # React Application (src/pages, src/components)
├── script/             # Database maintenance and reset scripts
├── public/             # Static assets and PWA manifest
├── reset-db.ts         # Master DB reset script
├── vite.config.ts      # Build and PWA configuration
└── tailwind.config.ts  # Design system tokens
```

---

## 🌐 API Reference

| Endpoint                 | Method     | Description                                   |
| :----------------------- | :--------- | :-------------------------------------------- |
| `/api/auth/register`     | `POST`     | Create a new volunteer account                |
| `/api/trees`             | `GET/POST` | Fetch or Register a new tree record           |
| `/api/trees/:id/updates` | `POST`     | Add mandatory growth photos and health status |
| `/api/events`            | `GET/POST` | Manage district-wide planting initiatives     |
| `/api/stats`             | `GET`      | Fetch real-time impact data                   |

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Made with ❤️ for a Greener Gampaha**
🌱 _Every breath counts. Every sapling matters._
