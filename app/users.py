from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_users import FastAPIUsers
from fastapi_users.db import SQLAlchemyUserDatabase, SQLAlchemyUserDatabaseAsync
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy
from fastapi_users_db_sqlalchemy import SQLAlchemyUserDatabase
from .db import get_session
from .models import User, UserCreate, UserUpdate, UserDB

# Secret for JWT authentication
SECRET = "SECRET"


# Dependency to get the SQLAlchemy User Database
async def get_user_db(session: AsyncSession = Depends(get_session)):
    yield SQLAlchemyUserDatabaseAsync(session, User)


# JWT Strategy
def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)


# Bearer transport for JWT authentication
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

# Authentication backend for JWT
auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# FastAPI Users setup
fastapi_users = FastAPIUsers[User, UserCreate, UserUpdate, UserDB](
    get_user_db,
    [auth_backend],
)

# Current user
current_user = fastapi_users.current_user
