from fastapi_users import schemas

class UserRead(schemas.BaseUser[int]):
    first_name: str | None = None
    last_name: str | None = None

class UserCreate(schemas.BaseUserCreate):
    first_name: str
    last_name: str

