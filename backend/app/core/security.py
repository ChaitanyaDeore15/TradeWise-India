import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Optional, Dict, Any
from app.core.config import settings

def hash_password(password: str) -> str:
    """Generate a secure salted PBKDF2-HMAC-SHA256 password hash."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        iterations=100_000
    )
    return f"{salt}${key.hex()}"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored salt$hash string."""
    try:
        salt, expected_hex = hashed_password.split("$")
        actual_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations=100_000
        )
        return hmac.compare_digest(actual_key.hex(), expected_hex)
    except Exception:
        return False

def create_access_token(data: Dict[str, Any], expires_delta_minutes: Optional[int] = None) -> str:
    """Create a tamper-evident HMAC-SHA256 signed JWT token."""
    to_encode = data.copy()
    if expires_delta_minutes:
        expire = int(time.time()) + (expires_delta_minutes * 60)
    else:
        expire = int(time.time()) + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode["exp"] = expire
    
    header = {"alg": "HS256", "typ": "JWT"}
    
    def b64url(s: bytes) -> str:
        return base64.urlsafe_b64encode(s).decode("utf-8").rstrip("=")
    
    encoded_header = b64url(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    encoded_payload = b64url(json.dumps(to_encode, separators=(",", ":")).encode("utf-8"))
    
    signature = hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        f"{encoded_header}.{encoded_payload}".encode("utf-8"),
        hashlib.sha256
    ).digest()
    
    return f"{encoded_header}.{encoded_payload}.{b64url(signature)}"

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify HMAC-SHA256 JWT signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        encoded_header, encoded_payload, received_sig = parts
        
        # Verify signature
        expected_sig = hmac.new(
            settings.SECRET_KEY.encode("utf-8"),
            f"{encoded_header}.{encoded_payload}".encode("utf-8"),
            hashlib.sha256
        ).digest()
        
        # Base64 pad
        def b64url_decode(s: str) -> bytes:
            padding = 4 - (len(s) % 4)
            if padding != 4:
                s += "=" * padding
            return base64.urlsafe_b64decode(s)
        
        if not hmac.compare_digest(b64url_decode(received_sig), expected_sig):
            return None
        
        payload = json.loads(b64url_decode(encoded_payload).decode("utf-8"))
        if "exp" in payload and time.time() > payload["exp"]:
            return None # Expired
            
        return payload
    except Exception:
        return None
