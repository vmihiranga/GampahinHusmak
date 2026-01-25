# Profile Photo & Role-Based Access Control Implementation

## ✅ Changes Completed

### 1. Profile Photo Upload Feature

#### Schema Updates (`shared/schema.ts`)

- Added `profileImage` field to `registerSchema` (optional string)
- Users can now upload profile pictures during registration

#### Backend Updates (`server/models.ts` & `server/routes.ts`)

- User model already had `profileImage` field
- Updated `/api/auth/register` endpoint to accept and save profile images
- Profile images are stored as base64 strings or URLs

#### Frontend Updates (`client/src/pages/auth.tsx`)

- Added Avatar component with file upload functionality
- Users can click avatar or "Upload Photo" button to select image
- Real-time preview of selected profile picture
- Clean, user-friendly UI with upload icon

### 2. Role-Based Access Control

#### User Roles

- **user** - Regular users (default)
- **volunteer** - Volunteer users
- **admin** - Administrators
- **superadmin** - Super administrators (highest privilege)

#### Middleware Functions (`server/routes.ts`)

1. **`requireAuth`** - Ensures user is logged in
2. **`requireAdmin`** - Requires admin OR superadmin role
3. **`requireSuperAdmin`** - Requires superadmin role only

#### Access Control Rules

| Route           | Access Level             |
| --------------- | ------------------------ |
| `/dashboard`    | Any logged-in user       |
| `/admin`        | Admin + Super Admin only |
| User management | Admin + Super Admin      |
| Role updates    | Super Admin only         |
| User deletion   | Super Admin only         |

### 3. New Admin API Endpoints

```
GET    /api/admin/users              - Get all users (admin+)
PUT    /api/admin/users/:id/role     - Update user role (superadmin only)
GET    /api/admin/summary             - Admin dashboard stats (admin+)
DELETE /api/admin/users/:id           - Delete user (superadmin only)
```

#### Admin Dashboard Summary Includes:

- Total trees, active trees
- Total users, total admins
- Total events, upcoming events
- Pending contact messages
- Recent users (last 5)
- Recent trees (last 5)

## 🎯 Usage

### For Users:

1. Register with optional profile photo
2. Access `/dashboard` after login
3. View and manage your trees

### For Admins:

1. Access `/admin` dashboard
2. View all users and statistics
3. Manage users (with superadmin: change roles, delete users)
4. Monitor system activity

### For Super Admins:

1. All admin privileges
2. Can promote/demote users to admin
3. Can delete users
4. Full system control

## 🔒 Security Features

- Session-based authentication
- Password hashing with bcrypt
- Role-based middleware protection
- Secure cookie configuration
- MongoDB session store

## 📝 Next Steps

To create a super admin user, you'll need to manually update a user in the database:

```javascript
// In MongoDB or via script
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "superadmin" } },
);
```

Or create a seed script to initialize the first super admin.
