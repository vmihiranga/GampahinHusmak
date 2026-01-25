# Gampahin Husmak - Tree Planting Platform

A comprehensive tree planting and monitoring platform for the Gampaha District, built with MongoDB, Express, React, and Node.js.

## 🌳 Features

- **User Management**: Registration, authentication, and role-based access (Admin, Volunteer, User)
- **Tree Registry**: Record and track planted trees with geolocation
- **Progress Tracking**: Monthly updates on tree growth and health
- **Event Management**: Organize and participate in tree planting events
- **Gallery**: Share and view photos of planted trees
- **Statistics Dashboard**: Real-time stats on trees planted, CO₂ offset, and community impact
- **Contact System**: Submit inquiries and feedback

## 🗄️ Database

This project uses **MongoDB Atlas** as the database. The connection string is configured in the `.env` file.

### Database Structure

- **Users**: User accounts with authentication
- **Trees**: Individual tree records with location and health tracking
- **TreeUpdates**: Progress updates for each tree
- **Events**: Community planting events
- **Gallery**: Photo gallery items
- **Contact**: Contact form submissions
- **Achievements**: User badges and achievements

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Project-Gampahin
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Variables**

   The `.env` file is already configured with:

   ```env
   DATABASE_URL=mongodb+srv://gampahinhusmak:cXKgX4VWlWDufISQ@cluster0.qifmy9g.mongodb.net/gampahin?retryWrites=true&w=majority
   NODE_ENV=development
   PORT=5000
   SESSION_SECRET=gampahin-husmak-secret-key-2026
   ```

4. **Seed the Database**

   Populate the database with sample data:

   ```bash
   npm run db:seed
   ```

   This will create:
   - 1 Admin user
   - 3 Sample users
   - 5 Sample trees
   - 3 Sample events
   - 3 Gallery items

5. **Start the Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5000`

## 👤 Login Credentials

After seeding the database, you can log in with:

### Admin Account

- **Email**: admin@gampahinhusmak.lk
- **Password**: admin123

### User Accounts

- **Email**: john@example.com | **Password**: user123
- **Email**: jane@example.com | **Password**: user123
- **Email**: mike@example.com | **Password**: user123

## 📁 Project Structure

```
Project-Gampahin/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API client
│   │   └── hooks/         # Custom React hooks
│   └── index.html
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── models.ts         # MongoDB schemas
│   ├── db.ts             # Database connection
│   └── storage.ts        # (Deprecated)
├── script/
│   ├── seed.ts           # Database seeding script
│   └── build.ts          # Production build script
├── shared/               # Shared types and schemas
│   └── schema.ts         # Zod validation schemas
├── .env                  # Environment variables
├── package.json
└── README.md
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:seed` - Seed database with sample data
- `npm run check` - TypeScript type checking

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Trees

- `GET /api/trees` - Get all trees
- `GET /api/trees/:id` - Get single tree
- `POST /api/trees` - Create new tree
- `PUT /api/trees/:id` - Update tree
- `POST /api/trees/:id/updates` - Add tree update

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event
- `POST /api/events/:id/join` - Join event

### Gallery

- `GET /api/gallery` - Get gallery items
- `POST /api/gallery` - Upload to gallery
- `POST /api/gallery/:id/like` - Like gallery item

### Contact

- `POST /api/contact` - Submit contact form
- `GET /api/contact` - Get all contacts (Admin only)

### Statistics

- `GET /api/stats` - Get general statistics
- `GET /api/stats/user/:userId` - Get user statistics

## 🔧 Technologies Used

### Frontend

- React 19
- TypeScript
- TanStack Query (React Query)
- Wouter (Routing)
- Tailwind CSS
- Radix UI Components
- Framer Motion

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- TypeScript
- bcryptjs (Password hashing)
- express-session
- Zod (Validation)

## 📝 Notes

- The application uses session-based authentication
- All passwords are hashed using bcryptjs
- MongoDB connection is cached for optimal performance
- The frontend uses React Query for efficient data fetching and caching

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🌍 Environment

- **Production**: Configure `NODE_ENV=production` in `.env`
- **Development**: Already configured with `NODE_ENV=development`

## 🔐 Security

- Never commit the `.env` file to version control
- Change the `SESSION_SECRET` in production
- Use environment-specific MongoDB credentials
- Enable MongoDB IP whitelisting in production

---

**Made with 🌱 for a greener Gampaha**
