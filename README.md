# Task Management System

A comprehensive task management application built with FastAPI backend and modern HTML/CSS/JS frontend, featuring user authentication, JWT tokens, and full CRUD operations for tasks.

## 🚀 Features

### Backend (FastAPI)
- **User Authentication**: Secure signup/login with JWT tokens
- **Task Management**: Full CRUD operations (Create, Read, Update, Delete)
- **Database**: SQLite with SQLAlchemy ORM
- **Security**: Password hashing with bcrypt, JWT token validation
- **API Documentation**: Auto-generated Swagger UI and ReDoc
- **CORS**: Enabled for frontend integration

### Frontend (HTML/CSS/JS)
- **Modern UI**: Responsive design with Font Awesome icons
- **User Authentication**: Login/signup forms with validation
- **Task Management**: Add, edit, delete, and filter tasks
- **Real-time Updates**: Dynamic task list updates
- **Search & Filter**: Filter by status and search by title
- **Toast Notifications**: User feedback for actions

## 🛠️ Technology Stack

- **Backend**: FastAPI, SQLAlchemy, Pydantic, JWT, bcrypt
- **Database**: SQLite
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Testing**: pytest, pytest-asyncio
- **Authentication**: JWT tokens with bcrypt password hashing

## 📋 Prerequisites

- Python 3.8+
- pip (Python package installer)
- Modern web browser

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd assignment
```

### 2. Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application

#### Start Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend Server (Optional)
```bash
cd frontend
python3 -m http.server 3000
```

## 🌐 Access Points

- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Interactive API Docs**: http://localhost:8000/redoc
- **Frontend**: http://localhost:3000

## 📚 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /token` - User login (get JWT token)

### Users
- `GET /users/me` - Get current user info

### Tasks
- `POST /tasks/` - Create new task
- `GET /tasks/` - Get all tasks (with filtering)
- `GET /tasks/{task_id}` - Get specific task
- `PUT /tasks/{task_id}` - Update task
- `DELETE /tasks/{task_id}` - Delete task

### Root
- `GET /` - API information

## 🧪 Testing

Run the test suite to verify functionality:

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=app
```

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication with expiration
- **Input Validation**: Pydantic models for data validation
- **CORS Protection**: Configurable cross-origin requests
- **SQL Injection Protection**: SQLAlchemy ORM

## 📱 Frontend Features

### User Interface
- **Responsive Design**: Works on desktop and mobile
- **Modern UI**: Clean, intuitive interface
- **Real-time Updates**: Dynamic content without page refresh
- **Form Validation**: Client-side and server-side validation

### Task Management
- **Add Tasks**: Modal form with all task fields
- **Edit Tasks**: In-place editing with validation
- **Delete Tasks**: Confirmation before deletion
- **Status Updates**: Quick status changes
- **Due Date Management**: Date picker for task deadlines

### Filtering & Search
- **Status Filter**: Filter by Pending, In Progress, Completed
- **Search**: Real-time search by task title
- **Sorting**: Tasks organized by creation date

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username
- `email`: Unique email address
- `hashed_password`: Bcrypt hashed password
- `is_active`: Account status
- `created_at`: Account creation timestamp

### Tasks Table
- `id`: Primary key
- `title`: Task title
- `description`: Task description (optional)
- `status`: Task status (Pending, In Progress, Completed)
- `due_date`: Task deadline (optional)
- `owner_id`: Foreign key to users table
- `created_at`: Task creation timestamp
- `updated_at`: Last modification timestamp

## 🔧 Configuration

### Environment Variables
The application uses default SQLite database. For production, you can configure:

```bash
# Database
DATABASE_URL=sqlite:///./tasks.db

# JWT Settings
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Settings
ALLOWED_ORIGINS=["http://localhost:3000"]
```

### CORS Configuration
CORS is enabled for development. For production, restrict to your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

## 🚀 Deployment

### Production Considerations
1. **Database**: Use PostgreSQL or MySQL instead of SQLite
2. **Environment Variables**: Set proper SECRET_KEY and database URLs
3. **HTTPS**: Enable SSL/TLS for production
4. **CORS**: Restrict to your frontend domain
5. **Rate Limiting**: Implement API rate limiting
6. **Logging**: Add proper logging and monitoring

### Docker Deployment
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📊 API Response Examples

### Successful User Registration
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

### Successful Task Creation
```json
{
  "id": 1,
  "title": "Complete Project",
  "description": "Finish the task management system",
  "status": "Pending",
  "due_date": "2024-01-20T23:59:59",
  "owner_id": 1,
  "created_at": "2024-01-15T10:30:00",
  "updated_at": null,
  "owner": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00"
  }
}
```

### Error Response
```json
{
  "detail": "Username already registered"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 8000
   lsof -i :8000
   # Kill the process
   kill -9 <PID>
   ```

2. **Database Locked**
   ```bash
   # Remove database file and restart
   rm tasks.db
   uvicorn app.main:app --reload
   ```

3. **Import Errors**
   ```bash
   # Ensure virtual environment is activated
   source venv/bin/activate
   # Reinstall dependencies
   pip install -r requirements.txt
   ```

### Logs
Check the console output for detailed error messages. The application provides comprehensive logging for debugging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- SQLAlchemy for database ORM
- Pydantic for data validation
- Font Awesome for icons
- Modern CSS for responsive design

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the test files for usage examples

---

**Happy Task Managing!** 🎯✨ 