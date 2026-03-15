# Student Result Management System (SRMS)

A comprehensive web-based application for managing student results, academic processes, and administrative workflows in universities.

## Overview

The Student Result Management System (SRMS) is designed to streamline the management of academic results, course assignments, student enrollments, and administrative tasks within a university environment. It supports multiple user roles including University Administrators, Deans, Heads of Department (HOD), Exam Officers, Lecturers, and Students, each with tailored functionalities.

## Features

### Core Functionality
- **User Management**: Role-based access control with secure authentication
- **Academic Structure**: Manage universities, faculties, departments, programs, and courses
- **Result Management**: Submit, verify, approve, and publish student results
- **Course Assignments**: Assign courses to lecturers and track assignments
- **Student Enrollment**: Manage student registrations and academic progress
- **Reporting & Analytics**: Generate reports and view dashboard statistics

### User Roles & Permissions

#### University Admin
- Create and manage admin accounts (Exam Officer, Dean, HOD)
- Oversee all university data and configurations
- View system-wide analytics and reports
- Manage user accounts and permissions

#### Dean
- Oversee faculty-level operations
- Review and approve result submissions
- Manage department assignments within faculty
- View faculty-specific reports and analytics

#### Head of Department (HOD)
- Manage department-specific course assignments
- Oversee lecturer activities within department
- Review departmental results and performance

#### Exam Officer
- Manage result verification and approval processes
- Publish results to students
- Handle result corrections and re-submissions
- Generate exam-related reports

#### Lecturer
- Submit course results for students
- View assigned courses and student performance
- Access performance tracking and analytics

#### Student
- View personal academic results and GPA
- Access course registrations and history
- Receive notifications and updates

## Tech Stack

### Backend
- **Django**: Web framework for robust backend development
- **Django REST Framework**: API development and serialization
- **PostgreSQL/SQLite**: Database management
- **JWT Authentication**: Secure token-based authentication
- **Django CORS Headers**: Cross-origin resource sharing

### Frontend
- **React**: User interface library
- **Vite**: Fast build tool and development server
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **CSS**: Styling and responsive design

### Development Tools
- **Python**: Backend programming language
- **JavaScript**: Frontend programming language
- **Git**: Version control
- **VS Code**: Recommended IDE

## Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Database setup**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Create superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Navigate to backend and collect static files**
   ```bash
   cd ../backend
   python manage.py collectstatic
   ```

3. **Configure production settings**
   - Update `backend/fastresult/settings.py` for production database
   - Set environment variables for secrets
   - Configure web server (nginx/apache) and WSGI/ASGI

## Usage

### Accessing the Application
- Backend API: `http://localhost:8000`
- Frontend: `http://localhost:5173` (Vite dev server)

### API Documentation
The API endpoints are organized by functionality:

#### Authentication
- `POST /api/login/` - User login
- `POST /api/register-student/` - Student registration
- `POST /api/register-lecturer/` - Lecturer registration

#### University Management
- `GET /api/universities/` - List approved universities
- `GET /api/faculties/{university_id}/` - Get faculties by university
- `GET /api/departments/{faculty_id}/` - Get departments by faculty

#### Admin Functions
- `POST /api/create-admin-account/` - Create admin accounts
- `GET /api/dashboard/stats/` - Dashboard statistics
- `GET /api/dashboard/pending-approvals/` - Pending result approvals

#### Result Management
- `GET /api/results/` - List results
- `POST /api/results/` - Create/update results
- `PATCH /api/results/{id}/verify/` - Verify results

### User Workflows

1. **University Setup**: Admin creates university structure (faculties, departments, courses)
2. **User Registration**: Students and lecturers register accounts
3. **Course Assignment**: HOD assigns courses to lecturers
4. **Result Submission**: Lecturers submit course results
5. **Result Verification**: Exam Officers verify submitted results
6. **Result Approval**: Deans approve verified results
7. **Result Publication**: Exam Officers publish approved results

## Project Structure

```
FINAL-SRMS/
├── backend/                    # Django backend
│   ├── core/                   # Django main app
│   │   ├── models.py          # Database models
│   │   ├── views.py           # API views
│   │   ├── serializers.py     # Data serialization
│   │   ├── urls.py            # URL routing
│   │   ├── permissions.py     # Custom permissions
│   │   └── management/        # Custom management commands
│   ├── fastresult/            # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── db.sqlite3             # SQLite database
│   ├── manage.py              # Django management script
│   ├── TODO.md                # Project notes
│   ├── create_demo_admins.py  # Demo admin creation script
│   ├── folder-alias.json      # Folder alias config
│   └── private-folder-alias.json # Private config
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   ├── pages/             # Page components by role
│   │   ├── contexts/          # React contexts
│   │   ├── services/          # API service functions
│   │   └── assets/            # Static assets
│   ├── public/
│   └── package.json
├── .venv/                     # Python virtual environment
├── README.md                  # Project documentation
└── requirements.txt           # Python dependencies (in backend)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation for API changes
- Ensure cross-browser compatibility

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@srms.com or create an issue in the repository.

## Roadmap

- [ ] Mobile application development
- [ ] Advanced analytics and reporting
- [ ] Integration with learning management systems
- [ ] Multi-language support
- [ ] API rate limiting and caching
- [ ] Automated testing suite expansion

---

**Note**: This is a development version. For production use, ensure proper security configurations and testing.