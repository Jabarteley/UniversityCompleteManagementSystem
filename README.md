# University Records Management System (URMS)

A comprehensive web-based records management system for universities, focusing on managing personnel and student data with role-based access control.

## 🎯 Purpose

To design and implement an automated web-based records management system for universities with the following goals:

- Reduce physical/manual paperwork
- Improve record tracking, updating, and report generation
- Support staff and student record operations
- Provide controlled access to academic/administrative modules

## 👥 User Roles & Activities

### 1. Admin User (Registrar)
- ✅ Login
- ✅ Add New User
- ✅ Update/Delete Users
- ✅ Logout

### 2. Staff User (Administrative Registry)
- ✅ Login
- ✅ Add Records
- ✅ View Records
- ✅ Retrieve Records
- ✅ Update Records (Staff and Students)
- ✅ Create/Update Nominal Roll, Promotions, Leave Grants, Employment, etc.
- ✅ Write Reports
- ✅ Delete Records

### 3. Staff User (Student Affairs)
- ✅ Login
- ✅ Hostel Allocations
- ✅ Verify Check-in/Out Student from Hostel
- ✅ Download Student Reports
- ✅ Upload Students' Results
- ✅ Checking of Admission Status
- ✅ Mobilize/Upload Student's Records to dedicated websites (JAMB, NYSC, etc.)

### 4. Student User
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
- ✅ Login
- ✅ Check Course Allocation
- ✅ Upload Results
- ✅ Update/Delete Results
- ✅ Logout

### 6. Head of Department User
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

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd UniversityCompleteManagementSystem
    ```

2.  **Install dependencies**
    ```bash
    # Install client and server dependencies
    npm install
    ```

3.  **Set up MongoDB**
    -   Install MongoDB locally or use MongoDB Atlas.
    -   Create a database for the application (e.g., `urms_database`).
    -   Update the connection string in `server/.env`.

4.  **Configure Environment Variables**

    Create a `.env` file in the `server` directory and add the following:

    ```env
    # Server environment (server/.env)
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/urms_database
    JWT_SECRET=your_jwt_secret_key_here
    JWT_EXPIRE=7d
    NODE_ENV=development
    ```

5.  **Start the Application**
    ```bash
    npm run dev
    ```

6.  **Create Demo Users (Optional)**
    ```bash
    npm run seed:demo
    ```

    The application will be available at:
    -   **Frontend:** http://localhost:5173
    -   **Backend API:** http://localhost:5000

## 🏗️ System Architecture

### Frontend (React + TypeScript)
-   **Framework:** React 18 with TypeScript and Vite
-   **Styling:** Tailwind CSS
-   **State Management:** React Query + Context API
-   **Routing:** React Router v6
-   **UI Components:** Headless UI and custom components with Framer Motion animations
-   **Icons:** Lucide React

### Backend (Node.js + Express)
-   **Runtime:** Node.js with Express.js and TypeScript
-   **Database:** MongoDB with Mongoose ODM
-   **Authentication:** JWT with bcrypt password hashing
-   **Security:** Helmet, CORS, Rate limiting, express-mongo-sanitize
-   **Validation:** Express Validator

## 🔧 Key Features

### 📱 Role-Based Dashboards
-   **Student Dashboard:** Academic progress, admission checking, result portal.
-   **Staff Registry Dashboard:** Complete records management system.
-   **Staff Affairs Dashboard:** Hostel management, admission status, external integrations.
-   **Academic Staff Dashboard:** Course allocation, result upload/management.
-   **Head of Department Dashboard:** Course allocation creation, staff management.
-   **Admin Dashboard:** User management and system administration.

### 🔒 Security Features
-   **Authentication:** JWT-based secure authentication.
-   **Authorization:** Role-based access control (RBAC).
-   **Data Validation:** Input sanitization and validation.
-   **Rate Limiting:** API rate limiting for security.

### ✨ Course Reconciliation
-   A tool for Heads of Department to identify and report discrepancies in student course registrations.
-   Compares registered courses against student's program, level, and department.
-   Generates a report of students with incorrect course registrations.

## 📁 Project Structure

```
UniversityCompleteManagementSystem/
├── src/                          # Frontend source code
│   ├── api/                     # API client functions
│   ├── components/              # Reusable UI components
│   ├── contexts/                # React contexts
│   ├── pages/                   # Page components
│   └── types/                   # TypeScript type definitions
├── server/                      # Backend source code
│   ├── src/
│   │   ├── config/             # Database configuration
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # MongoDB models
│   │   ├── routes/             # API routes
│   │   ├── seeders/            # Database seeders
│   │   └── utils/              # Utility functions
└── README.md                    # Project documentation
```

## 🔄 API Endpoints

### Authentication
-   `POST /api/auth/login` - User login
-   `GET /api/auth/me` - Get current user

### Course Reconciliation
-   `POST /api/course-reconciliation/reconcile` - Start course reconciliation process
-   `GET /api/course-reconciliation/report/:id` - Get reconciliation report

*For a full list of endpoints, please refer to the route definitions in `server/src/routes`.*

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

## 🔐 Demo User Accounts

After running `npm run seed:demo`, you can use these accounts:

-   **Admin (Registrar):** `admin@university.edu` / `password123`
-   **Staff Registry:** `registry@university.edu` / `password123`
-   **Staff Affairs:** `affairs@university.edu` / `password123`
-   **Academic Staff:** `lecturer@university.edu` / `password123`
-   **Head of Department:** `hod@university.edu` / `password123`
-   **Student:** `student@university.edu` / `password123`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

**University Records Management System (URMS)** - Streamlining academic administration through technology. 🎓
