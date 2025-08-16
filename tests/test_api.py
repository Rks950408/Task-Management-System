import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import get_db, Base
from app.main import app
from app import models, crud, auth
import os

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create test database tables
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def test_user():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }

@pytest.fixture
def test_task():
    return {
        "title": "Test Task",
        "description": "Test Description",
        "status": "Pending",
        "due_date": "2024-12-31T23:59:59"
    }

class TestAuthentication:
    def test_signup_success(self, test_db, test_user):
        response = client.post("/signup", json=test_user)
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == test_user["username"]
        assert data["email"] == test_user["email"]
        assert "id" in data

    def test_signup_duplicate_username(self, test_db, test_user):
        # First signup
        client.post("/signup", json=test_user)
        # Second signup with same username
        response = client.post("/signup", json=test_user)
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_signup_duplicate_email(self, test_db, test_user):
        # First signup
        client.post("/signup", json=test_user)
        # Second signup with different username but same email
        duplicate_user = test_user.copy()
        duplicate_user["username"] = "differentuser"
        response = client.post("/signup", json=duplicate_user)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_login_success(self, test_db, test_user):
        # Signup first
        client.post("/signup", json=test_user)
        # Login
        response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_invalid_credentials(self, test_db, test_user):
        # Signup first
        client.post("/signup", json=test_user)
        # Login with wrong password
        response = client.post("/token", data={
            "username": test_user["username"],
            "password": "wrongpassword"
        })
        assert response.status_code == 401

class TestTasks:
    def test_create_task_authenticated(self, test_db, test_user, test_task):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Create task
        headers = {"Authorization": f"Bearer {token}"}
        response = client.post("/tasks/", json=test_task, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == test_task["title"]
        assert data["description"] == test_task["description"]

    def test_create_task_unauthenticated(self, test_db, test_task):
        response = client.post("/tasks/", json=test_task)
        assert response.status_code == 401

    def test_get_tasks_authenticated(self, test_db, test_user, test_task):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        
        # Create task first
        headers = {"Authorization": f"Bearer {token}"}
        client.post("/tasks/", json=test_task, headers=headers)
        
        # Get tasks
        response = client.get("/tasks/", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["title"] == test_task["title"]

    def test_get_tasks_unauthenticated(self, test_db):
        response = client.get("/tasks/")
        assert response.status_code == 401

    def test_update_task(self, test_db, test_user, test_task):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create task
        create_response = client.post("/tasks/", json=test_task, headers=headers)
        task_id = create_response.json()["id"]
        
        # Update task
        update_data = {"title": "Updated Task", "status": "In Progress"}
        response = client.put(f"/tasks/{task_id}", json=update_data, headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task"
        assert data["status"] == "In Progress"

    def test_delete_task(self, test_db, test_user, test_task):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create task
        create_response = client.post("/tasks/", json=test_task, headers=headers)
        task_id = create_response.json()["id"]
        
        # Delete task
        response = client.delete(f"/tasks/{task_id}", headers=headers)
        assert response.status_code == 200
        assert "Task deleted successfully" in response.json()["message"]

    def test_get_task_by_id(self, test_db, test_user, test_task):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Create task
        create_response = client.post("/tasks/", json=test_task, headers=headers)
        task_id = create_response.json()["id"]
        
        # Get task by ID
        response = client.get(f"/tasks/{task_id}", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == test_task["title"]

    def test_get_nonexistent_task(self, test_db, test_user):
        # Signup and login
        client.post("/signup", json=test_user)
        login_response = client.post("/token", data={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try to get non-existent task
        response = client.get("/tasks/999", headers=headers)
        assert response.status_code == 404

class TestErrorHandling:
    def test_invalid_jwt_token(self, test_db):
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 401

    def test_malformed_jwt_token(self, test_db):
        headers = {"Authorization": "Bearer malformed.token.here"}
        response = client.get("/users/me", headers=headers)
        assert response.status_code == 401

    def test_missing_authorization_header(self, test_db):
        response = client.get("/users/me")
        assert response.status_code == 401

    def test_root_endpoint(self, test_db):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert "docs" in data 