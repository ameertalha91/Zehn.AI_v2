# CSS AI MVP - System Architecture Guide

## 🏗️ **SYSTEM OVERVIEW**

This is a comprehensive course management system built with Next.js 14, supporting multiple user roles (Student, Tutor, Admin) and dual content sources (Database courses + JSON pathways).

## 📁 **CORE MODULE STRUCTURE**

### **Frontend Architecture**
```
app/
├── student/courses/[courseId]/page.tsx    # Main learning interface
├── student/courses/page.tsx               # Course listing
├── login/page.tsx                         # Authentication
├── dashboard/page.tsx                     # Role-based dashboard
└── api/                                   # Backend API routes
    ├── courses/route.ts                   # Course management
    ├── courses/[courseId]/enroll/route.ts # Enrollment system
    └── auth/login/route.ts                # Authentication
```

### **State Management**
```
lib/
├── course-context.tsx                     # Global course state
├── auth-context.tsx                       # User authentication
├── course-sync.ts                         # Real-time updates
└── db.ts                                  # Database connection
```

### **Components**
```
components/
├── ProtectedRoute.tsx                     # Role-based access control
├── Nav.tsx                                # Navigation
└── VideoQuizComponent.tsx                 # Video player
```

## 🔄 **DATA FLOW ARCHITECTURE**

### **1. Course Data Sources**
- **Database Courses**: Stored in Prisma (SQLite)
  - Classes → Lectures → Video URLs
  - Full CRUD operations
  - Enrollment tracking
  
- **JSON Pathway Courses**: Static content from `/data/learning-pathways.json`
  - Sessions → Video URLs
  - Read-only content
  - Frontend enrollment management

### **2. User Authentication Flow**
```
Login → Auth Context → Protected Route → Role-based Access
```

### **3. Course Learning Flow**
```
Course List → Course Detail → Video Player → Progress Tracking
```

## 🎯 **KEY MODULES TO UNDERSTAND**

### **For Course Management:**
1. **`/app/api/courses/route.ts`** - Main course API
2. **`/lib/course-context.tsx`** - Frontend state management
3. **`/prisma/schema.prisma`** - Database structure
4. **`/app/student/courses/[courseId]/page.tsx`** - Learning interface

### **For Authentication:**
1. **`/lib/auth-context.tsx`** - User state management
2. **`/components/ProtectedRoute.tsx`** - Access control
3. **`/app/api/auth/login/route.ts`** - Login API

### **For Video Learning:**
1. **`/app/student/courses/[courseId]/page.tsx`** - Video player
2. **`/components/VideoQuizComponent.tsx`** - Video component
3. **`/app/api/courses/[courseId]/enroll/route.ts`** - Enrollment

## 🔐 **ROLE-BASED ACCESS SYSTEM**

### **Student Role**
- View published courses
- Enroll in courses
- Watch videos and track progress
- Submit assignments

### **Tutor Role**
- Manage courses from their center
- Create and edit course content
- Grade assignments
- View student progress

### **Admin Role**
- Access all courses and users
- Manage centers and instructors
- System-wide oversight
- Override permissions

## 📊 **DATABASE RELATIONSHIPS**

```
User (STUDENT/TUTOR/ADMIN)
├── Center (for tutors/admins)
│   └── Class (courses)
│       ├── Lecture (videos)
│       ├── Enrollment (students)
│       ├── Assignment
│       └── Quiz
└── Enrollment (student enrollments)
```

## 🚀 **DEVELOPMENT WORKFLOW**

### **Adding New Features:**
1. **Database Changes**: Update `prisma/schema.prisma`
2. **API Endpoints**: Add routes in `app/api/`
3. **Frontend State**: Update `lib/course-context.tsx`
4. **UI Components**: Create/update components
5. **Access Control**: Update `ProtectedRoute` usage

### **Testing the System:**
1. Start dev server: `npm run dev`
2. Login as test user: `test@example.com` / `password123`
3. Navigate to Pakistan Affairs course
4. Verify video playback and enrollment

## 🔧 **CONFIGURATION FILES**

- **`package.json`** - Dependencies and scripts
- **`next.config.js`** - Next.js configuration
- **`tailwind.config.js`** - Styling configuration
- **`prisma/schema.prisma`** - Database schema
- **`middleware.ts`** - Route protection

## 📝 **IMPORTANT NOTES**

- **Dual Content System**: Database courses + JSON pathways
- **Real-time Updates**: Course-sync system for live updates
- **Role-based UI**: Different interfaces per user role
- **Video Integration**: YouTube embedding for course content
- **Progress Tracking**: Student completion and progress management

## 🐛 **TROUBLESHOOTING**

### **Common Issues:**
1. **Video not loading**: Check YouTube URL format
2. **Enrollment not working**: Verify API response includes `enrolledStudentsList`
3. **Access denied**: Check user role and ProtectedRoute configuration
4. **Database errors**: Run `npx prisma generate` and `npx prisma db push`

### **Debug Tools:**
- **Database**: `npx prisma studio`
- **API Testing**: Use browser dev tools or Postman
- **State Debugging**: Check localStorage and React DevTools
