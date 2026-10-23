"""
Security and Authorization Test Suite.
Verifies password hashing, token validation, tamper detection, and endpoint protection.
"""
import pytest
from app.core.security import (
    hash_password, verify_password, create_access_token, decode_access_token
)

def test_password_hashing():
    raw = "MySuperSecretP@ssword2026"
    hashed = hash_password(raw)
    assert hashed != raw
    assert "$" in hashed
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_tamper_detection():
    payload = {"sub": 42, "email": "test@tradewise.in"}
    token = create_access_token(payload, expires_delta_minutes=60)
    
    # Valid decode
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == 42
    
    # Tampered signature
    parts = token.split(".")
    tampered_token = f"{parts[0]}.{parts[1]}.tamperedSignature123"
    assert decode_access_token(tampered_token) is None

def test_jwt_expiration():
    payload = {"sub": 99}
    # Expired token (-10 minutes)
    expired_token = create_access_token(payload, expires_delta_minutes=-10)
    assert decode_access_token(expired_token) is None
