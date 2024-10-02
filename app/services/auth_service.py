from fastapi_users import FastAPIUsers
from fastapi_users.authentication import JWTStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from app.models.user import User
from app.db import async_session
import os

SECRET_KEY = os.getenv("SECRET_KEY")

# Initialize User DB adapter
user_db = SQLAlchemyUserDatabase(async_session, User)

# JWT strategy
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET_KEY, lifetime_seconds=3600)

fastapi_users = FastAPIUsers(
    user_db,
    [get_jwt_strategy()],
    UserRead,
    UserCreate,
)

auth_backend = fastapi_users.get_auth_backend(get_jwt_strategy)

