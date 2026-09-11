from collections.abc import Callable
from uuid import UUID

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models import User
from app.models.enums import UserRole
from app.repositories.user import UserRepository

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if creds is None or not creds.credentials:
        raise AppError("UNAUTHORIZED", "Authentication required", status_code=401)
    try:
        payload = decode_access_token(creds.credentials)
        user_id = UUID(payload["sub"])
    except (ValueError, KeyError) as exc:
        raise AppError("UNAUTHORIZED", "Invalid or expired token", status_code=401) from exc
    user = await UserRepository(db).get_by_id(user_id)
    if not user or not user.is_active:
        raise AppError("UNAUTHORIZED", "User not found or inactive", status_code=401)
    return user


def require_roles(*roles: UserRole) -> Callable:
    allowed = set(roles)

    async def _dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise AppError("FORBIDDEN", "Insufficient permissions", status_code=403)
        return user

    return _dep
