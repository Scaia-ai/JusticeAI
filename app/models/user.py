from fastapi_users_db_sqlalchemy import SQLAlchemyBaseUserTable
from sqlalchemy import Column, String
from app.db import Base

class User(SQLAlchemyBaseUserTable, Base):
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
