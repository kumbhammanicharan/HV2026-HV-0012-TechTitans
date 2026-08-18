HACKVERSE 2026 — Smart Campus Complaint, Maintenance & Service Request Tracking System
<img width="1907" height="884" alt="image" src="https://github.com/user-attachments/assets/84785ba6-f34a-446c-9fae-41f5cc8925b5" />

👥 Team
Team ID: HV-0012  
Team Name: TechTitans
Member	 Name
Member 1	Khubham Manicharan
Member 2	Chelpuri Chandramshu
Member 3	Goyal Rajender
Member 4	Doneti Manjunath
> Replace the member names and roles above with your actual team details.
---
📌 Project Overview
The Smart Campus Complaint, Maintenance & Service Request Tracking System is a role-based full-stack web application that digitizes the campus complaint and maintenance process.
Instead of relying on manual complaint registers, messages, or informal communication, the platform provides a centralized system where:
Students can submit and track complaints.
Staff/Technicians can manage assigned complaints and update their status.
Administrators can assign complaints, manage users, and monitor resolution performance.
The system provides complaint submission, tracking, assignment, status management, feedback, authentication, analytics, file uploads, and real-time communication infrastructure.
---
🎯 Problem Statement
Campus complaints related to infrastructure, electricity, internet, maintenance, facilities, and other services are often difficult to manage through manual processes.
Problems with the existing approach
Complaints may be lost or overlooked.
Students have limited visibility into complaint status.
Assigning complaints to responsible staff is difficult.
There is no centralized complaint history.
Staff workload is difficult to monitor.
Complaint-resolution performance is difficult to analyze.
Feedback collection is limited.
---
💡 Proposed Solution
Our system provides a centralized digital workflow:
```text
Student
   ↓
Submit Complaint
   ↓
Complaint Stored in MongoDB
   ↓
Administrator Reviews Complaint
   ↓
Complaint Assigned to Staff
   ↓
Staff Works on Complaint
   ↓
Status Updated
   ↓
Complaint Resolved
   ↓
Student Provides Feedback
```
Administrators can also monitor complaints, users, assignments, overdue complaints, categories, and staff performance through the dashboard.
---
✨ Key Features
👨‍🎓 Student
Student registration and login
Submit complaints
View submitted complaints
Track complaint status
View complaint details
Receive complaint updates
Submit feedback after resolution
Protected student routes
Light/dark theme support
👨‍🔧 Staff / Technician
Staff login and registration
Staff dashboard
View assigned complaints
Update complaint status
Add remarks
Upload supporting/resolution images
Monitor resolution progress
View feedback/performance information
👨‍💼 Administrator
View and manage complaints
Assign complaints to staff
Monitor pending, in-progress, and resolved complaints
Identify assigned and unassigned complaints
Identify overdue complaints
Manage students and staff
Activate/deactivate users
Block/unblock students
Delete users
View complaint and staff analytics
📊 Analytics
The administrator dashboard provides:
Total complaints
Pending complaints
In-progress complaints
Resolved complaints
Assigned and unassigned complaints
Overdue complaints
Total students and staff
Complaint-category statistics
Monthly complaint statistics
Technician workload
Feedback statistics
Average feedback rating
---
🔐 Authentication & Authorization
The application uses JWT-based authentication and role-based authorization.
Supported roles:
```text
student
staff
admin
```
Basic authentication flow:
```text
User Login
    ↓
Backend validates credentials
    ↓
JWT generated
    ↓
Token stored in browser
    ↓
User role identified
    ↓
Role-specific dashboard displayed
```
Protected backend routes use authentication and role-verification middleware.
---
🏗️ System Architecture
```text
┌─────────────────────────────┐
│       React Frontend        │
│                             │
│ Student UI                  │
│ Staff Dashboard             │
│ Admin Dashboard             │
│ Complaint Management        │
└──────────────┬──────────────┘
               │
               │ HTTP / REST API
               ▼
┌─────────────────────────────┐
│     Node.js + Express       │
│                             │
│ Authentication              │
│ Complaint Management        │
│ User Management             │
│ Feedback                    │
│ Analytics                   │
│ File Uploads                │
│ Authorization               │
└──────────────┬──────────────┘
               │
               │ Mongoose
               ▼
┌─────────────────────────────┐
│           MongoDB           │
│                             │
│ Users                       │
│ Complaints                  │
│ Feedback                    │
└─────────────────────────────┘

        ┌─────────────────┐
        │    Socket.IO    │
        │ Real-time Events│
        └─────────────────┘
```
---
🛠️ Technology Stack
Frontend
Technology	Purpose
React	Frontend UI
React Router DOM	Client-side routing
Axios	API requests
Tailwind CSS	Styling
Bootstrap	UI utilities/components
Lucide React	Icons
Recharts	Analytics and charts
JWT Decode	Reading JWT payload
Backend
Technology	Purpose
Node.js	Backend runtime
Express.js	REST API
MongoDB	Database
Mongoose	MongoDB ODM
JWT	Authentication
bcryptjs	Password hashing
Multer	File uploads
Nodemailer	Email functionality
Socket.IO	Real-time communication
CORS	Cross-origin requests
dotenv	Environment configuration
---
📁 Project Structure
```text
HV2026-HV-0012-TechTitans/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── app.js
│   └── package.json
│
├── docs/
│   └── Project-Report.pdf
│
├── assets/
│   └── screenshots/
│
├── .gitignore
├── package.json
└── README.md
```
---
⚙️ Prerequisites
Install the following before running the project:
Node.js
npm
MongoDB or MongoDB Atlas
Git
Modern web browser
Check Node.js and npm:
```bash
node --version
npm --version
```
---
🚀 Installation & Setup
1. Clone the Repository
```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd HV2026-HV-0012-TechTitans
```
2. Install Backend Dependencies
```bash
cd server
npm install
```
3. Configure Environment Variables
Create:
```text
server/.env
```
Add the required environment variables:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
PORT=5000

EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```
Never commit `.env` or other secrets to GitHub.
4. Start the Backend
```bash
cd server
npm start
```
Backend:
```text
http://localhost:5000
```
5. Start the Frontend
Open another terminal:
```bash
cd client
npm install
npm start
```
Frontend:
```text
http://localhost:3000
```
---
🗄️ Database
The application uses MongoDB for storing application data.
Main data handled by the system includes:
Users
Complaints
Feedback
MongoDB can be hosted locally or through MongoDB Atlas.
---
🔌 API
The backend exposes REST APIs under:
```text
/api
```
Major API areas include:
```text
/api/auth
/api/complaints
/api/feedback
/api/admin
```
The APIs support authentication, complaint management, assignment, status updates, feedback, user management, and administrative analytics.
---
🧭 Application Flow
Student
```text
Register / Login
      ↓
Student Home
      ↓
Submit Complaint
      ↓
Track Complaint
      ↓
View Resolution
      ↓
Submit Feedback
```
Staff
```text
Login
  ↓
Staff Dashboard
  ↓
View Assigned Complaints
  ↓
Work on Complaint
  ↓
Update Status
  ↓
Add Remarks / Evidence
  ↓
Resolve Complaint
```
Administrator
```text
Login
  ↓
Admin Dashboard
  ↓
Monitor Complaints
  ↓
Assign Staff
  ↓
Manage Users
  ↓
Monitor Analytics
  ↓
Review Performance
```
---
📎 File Uploads
The system supports complaint-related file uploads using Multer.
Uploaded files are served through:
```text
/uploads
```
These files can be used for complaint images or resolution evidence.
---
🔄 Real-Time Communication
The backend includes Socket.IO infrastructure for real-time complaint-related events and updates between connected users and administrators.
---
🛡️ Security
The project includes:
JWT authentication
Password hashing using bcrypt
Role-based authorization
Protected frontend routes
Protected backend routes
Admin-only and staff-only middleware
Environment variables for secrets
CORS configuration
Password exclusion from user responses
Important
Never upload the following to GitHub:
```text
.env
API keys
Database passwords
JWT secrets
Email passwords
Private keys
Service-account credentials
```
Make sure sensitive files are included in `.gitignore`.
---
🧪 Testing & Build
Run frontend tests:
```bash
cd client
npm test
```
Create a production build:
```bash
cd client
npm run build
```
Start the backend in development mode:
```bash
cd server
npm run dev
```
---
☁️ Deployment
The application consists of:
```text
Frontend → React
Backend  → Node.js + Express
Database → MongoDB
```
Production architecture:
```text
React Frontend
      ↓
Production Build
      ↓
Node.js + Express API
      ↓
MongoDB Atlas
```
Production environment variables should be configured through the hosting platform and should never be committed to the repository.
---
🎥 Demo
Live Demo: [https://campuscare-frontend-izin.onrender.com]
Demo Video: []
Project Report:https://docs.google.com/document/d/18ICAu0q75QImEtOWjC-gAMUnEwZ3yQb_/edit?usp=drive_link&ouid=112175209800142235897&rtpof=true&sd=true
---
📸 Screenshots
Add important screenshots of:
Student dashboard
Complaint submission
Complaint tracking
Staff dashboard
Admin dashboard
Analytics
---
🔮 Future Enhancements
Potential future improvements include:
Advanced notification system
More real-time updates
Improved analytics
Mobile application
Additional automation features
Integration with other campus services
---
👨‍💻 Team
Team: TechTitans  
Hackathon: HACKVERSE 2026  
Team ID:HV2026-0012
---
