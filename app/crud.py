from sqlalchemy.orm import Session
from sqlalchemy import and_
import models, schemas
from auth import get_password_hash
from typing import List, Optional

# User CRUD operations
def create_user(db: Session, user: schemas.UserCreate):
    """Create a new user."""
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_username(db: Session, username: str):
    """Get user by username."""
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    """Get user by email."""
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    """Get user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()

# Task CRUD operations
def create_task(db: Session, task: schemas.TaskCreate, owner_id: int):
    """Create a new task."""
    db_task = models.Task(**task.dict(), owner_id=owner_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_tasks(db: Session, owner_id: int, skip: int = 0, limit: int = 100, status: Optional[str] = None):
    """Get tasks for a specific user with optional status filtering."""
    query = db.query(models.Task).filter(models.Task.owner_id == owner_id)
    
    if status:
        query = query.filter(models.Task.status == status)
    
    return query.offset(skip).limit(limit).all()

def get_task(db: Session, task_id: int, owner_id: int):
    """Get a specific task by ID for a specific user."""
    return db.query(models.Task).filter(
        and_(models.Task.id == task_id, models.Task.owner_id == owner_id)
    ).first()

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate, owner_id: int):
    """Update a task."""
    db_task = get_task(db, task_id, owner_id)
    if not db_task:
        return None
    
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int, owner_id: int):
    """Delete a task."""
    db_task = get_task(db, task_id, owner_id)
    if not db_task:
        return False
    
    db.delete(db_task)
    db.commit()
    return True 