"""
Synapse Backend — JWT Security
================================
Handles JWT token verification for Supabase Auth.
Supabase issues standard JWTs signed with HS256 using the project's
JWT secret. We verify these server-side to authenticate API requests.

The JWT payload contains:
    - sub: user UUID (same as auth.users.id in Supabase)
    - email: user's email
    - exp: token expiration timestamp
    - aud: "authenticated"
    - role: "authenticated"
"""

from datetime import datetime, timezone

from fastapi import HTTPException, Request, status
from jose import JWTError, jwt

from app.core.config import get_settings


# ── Token Verification ────────────────────────────────────────────────────

def verify_jwt(token: str) -> dict:
    """
    Decode and validate a Supabase-issued JWT.

    Args:
        token: The raw JWT string (without "Bearer " prefix).

    Returns:
        The decoded JWT payload as a dict.

    Raises:
        HTTPException(401): If the token is invalid, expired, or malformed.
    """
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the token hasn't expired (jose checks this, but be explicit)
    exp = payload.get("exp")
    if exp and datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


# ── User Extraction ───────────────────────────────────────────────────────

def get_user_from_token(payload: dict) -> dict:
    """
    Extract user information from a verified JWT payload.

    Args:
        payload: The decoded JWT payload from verify_jwt().

    Returns:
        Dict with user_id (str) and email (str).

    Raises:
        HTTPException(401): If the payload is missing required fields.
    """
    user_id = payload.get("sub")
    email = payload.get("email")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload missing user ID",
        )

    return {
        "user_id": user_id,
        "email": email or "",
    }


# ── Request-Level Auth ────────────────────────────────────────────────────

async def get_current_user(request: Request) -> dict:
    """
    FastAPI dependency that extracts and verifies the user from an
    incoming request's Authorization header.

    Usage in a route:
        @router.get("/me")
        async def get_me(user: dict = Depends(get_current_user)):
            return {"user_id": user["user_id"]}

    Args:
        request: The incoming FastAPI request.

    Returns:
        Dict with user_id and email.

    Raises:
        HTTPException(401): If the header is missing or token is invalid.
    """
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Expect format: "Bearer <token>"
    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]
    from app.core.supabase_client import get_supabase_client
    supabase = get_supabase_client()
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise ValueError("No user found")
        return {
            "user_id": user_response.user.id,
            "email": user_response.user.email or ""
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
