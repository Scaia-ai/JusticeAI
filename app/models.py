from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID, uuid4
from sqlalchemy import String, Column, Boolean
from sqlalchemy.dialects.postgresql import UUID as SQLAlchemyUUID
from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTableUUID
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base

Base: DeclarativeMeta = declarative_base()


# User model
class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "users"

    id = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4, unique=True, index=True)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)


# Pydantic schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: UUID
    email: EmailStr


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
