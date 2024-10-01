from fastapi import APIRouter
from app.services.auth_service import fastapi_users, auth_backend

router = APIRouter()

# Add user authentication routes
router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_users_router(),
    prefix="/users",
    tags=["users"],
)
