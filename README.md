# University Records Management System (URMS)

A comprehensive web-based records management system for universities, focusing on managing personnel and student data with role-based access control.

## 🎯 Purpose
make sure the project meets the requirement and all the components are working
To design and implement an automated web-based records management system for universities with the following goals:
- Reduce physical/manual paperwork
- Improve record tracking, updating, and report generation
- Support staff and student record operations
- Provide controlled access to academic/administrative modules

## 👥 User Roles & Activities

### 1. Admin User (Registrar)
**Activities organized in modular form:**
- ✅ Login
- ✅ Add New User
- ✅ Update/Delete Users
- ✅ Logout

### 2. Staff User (Administrative Registry)
**Activities organized in modular form:**
- ✅ Login
- ✅ Add Records
- ✅ View Records
- ✅ Retrieve Records
- ✅ Update Records (Staff and Students)
- ✅ Create/Update Nominal Roll, Promotions, Leave Grants, Employment, etc.
- ✅ Write Reports
- ✅ Delete Records

### 3. Staff User (Student Affairs)
**Activities organized in modular form:**
- ✅ Login
- ✅ Hostel Allocations
- ✅ Verify Check-in/Out Student from Hostel
- ✅ Download Student Reports
- ✅ Upload Students' Results
- ✅ Checking of Admission Status
- ✅ Mobilize/Upload Student's Records to dedicated websites (JAMB, NYSC, etc.)

### 4. Student User
**Activities organized in modular form:**
- ✅ Login
- ✅ Create Student Profile
- ✅ Check Admission
- ✅ Make Fee Payment
- ✅ Check Semester Result
- ✅ Register Courses Per Semester
- ✅ Check Wrong Course
- ✅ Process Final Clearance
- ✅ Download Statement of Result
- ✅ Request for Transcripts
- ✅ Logout

### 5. Academic Staff (Lecturer) User
**Activities organized in modular form:**
- ✅ Login
- ✅ Check Course Allocation
- ✅ Upload Results
- ✅ Update/Delete Results
- ✅ Logout

### 6. Head Department User
**Activities organized in modular form:**
- ✅ Login
- ✅ Upload Results
- ✅ Create Course Allocation
- ✅ Course Reconciliation
- ✅ Add New Staff
- ✅ Logout

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd urms
```

2. **Install dependencies**
```bash
# Install client dependencies
npm install

# Install server dependencies
npm run install:server
```

3. **Set up MongoDB**
   - Install MongoDB locally or use MongoDB Atlas
   - Create a database for the application
   - Update the connection string in `server/.env`

4. **Configure Environment Variables**
```bash
# Server environment (server/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urms_database
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

5. **Start the Application**
```bash
npm run dev
```

6. **Create Demo Users (Optional)**
```bash
npm run seed:demo
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000

## 🏗️ System Architecture

### Frontend (React + TypeScript)
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query + Context API
- **Routing:** React Router v6
- **UI Components:** Custom components with Framer Motion animations
- **Icons:** Lucide React

### Backend (Node.js + Express)
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT with bcrypt password hashing
- **Security:** Helmet, CORS, Rate limiting
- **Validation:** Express Validator

### Database Schema
- **Students:** Complete academic and personal records
- **Staff:** Employment information and qualifications
- **Users:** Authentication and role-based permissions
- **Course Allocations:** Course assignments to lecturers
- **Hostel Allocations:** Student accommodation management

## 🔧 Key Features

### 📱 Role-Based Dashboards
- **Student Dashboard:** Academic progress, admission checking, result portal
- **Staff Registry Dashboard:** Complete records management system
- **Staff Affairs Dashboard:** Hostel management, admission status, external integrations
- **Academic Staff Dashboard:** Course allocation, result upload/management
- **Head of Department Dashboard:** Course allocation creation, staff management
- **Admin Dashboard:** User management and system administration

### 🔒 Security Features
- **Authentication:** JWT-based secure authentication
- **Authorization:** Role-based access control (RBAC)
- **Data Validation:** Input sanitization and validation
- **Rate Limiting:** API rate limiting for security

## 📁 Project Structure

```
urms/
├── src/                          # Frontend source code
│   ├── api/                     # API client functions
│   ├── contexts/                # React contexts
│   ├── pages/                   # Page components
│   └── types/                   # TypeScript type definitions
├── server/                      # Backend source code
│   ├── src/
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Express middleware
│   │   └── seeders/            # Database seeders
└── README.md                    # Project documentation
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Staff
- `GET /api/staff` - Get all staff
- `POST /api/staff` - Create new staff
- `POST /api/staff/:id/promote` - Promote staff
- `POST /api/staff/:id/leave` - Grant leave

### Course Allocations
- `GET /api/course-allocations` - Get course allocations
- `POST /api/course-allocations` - Create course allocation
- `POST /api/course-allocations/reconcile` - Course reconciliation

### Student Results
- `POST /api/student-results/upload` - Upload results
- `GET /api/student-results/student/:regNumber` - Get student results
- `PUT /api/student-results/:studentId/results/:resultId` - Update result
- `DELETE /api/student-results/:studentId/results/:resultId` - Delete result

### Hostel Allocations
- `GET /api/hostel-allocations` - Get hostel allocations
- `POST /api/hostel-allocations` - Create allocation
- `POST /api/hostel-allocations/:id/checkin` - Check in student
- `POST /api/hostel-allocations/:id/checkout` - Check out student

### Admissions
- `GET /api/admissions/check/:regNumber` - Check admission status
- `PUT /api/admissions/status/:id` - Update admission status

### External Integration
- `POST /api/external/jamb/upload` - Upload to JAMB
- `POST /api/external/nysc/upload` - Upload to NYSC
- `GET /api/external/history` - Get upload history

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server (both frontend and backend)
npm run dev:client   # Start only frontend
npm run dev:server   # Start only backend
npm run build        # Build for production
npm run lint         # Run ESLint
npm run seed:demo    # Create demo users for testing
```

### Environment Variables
```bash
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api

# Backend (server/.env)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/urms_database
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
```

## 🔐 Demo User Accounts

After running `npm run seed:demo`, you can use these accounts:

- **Admin (Registrar):** admin@university.edu / password123
- **Staff Registry:** registry@university.edu / password123  
- **Staff Affairs:** affairs@university.edu / password123
- **Academic Staff:** lecturer@university.edu / password123
- **Head of Department:** hod@university.edu / password123
- **Student:** student@university.edu / password123

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**University Records Management System (URMS)** - Streamlining academic administration through technology. 🎓