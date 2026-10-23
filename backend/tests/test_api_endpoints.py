"""
Integration tests for FastAPI application endpoints with database initialization fixture.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_root_disclaimer(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "TradeWise" in data["platform"]
    assert "SEBI" in data["disclaimer"]

def test_guest_login(client):
    response = client.post("/api/v1/auth/guest-login")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@tradewise.in"

def test_market_instruments_feed(client):
    response = client.get("/api/v1/markets/instruments")
    assert response.status_code == 200
    instruments = response.json()
    assert len(instruments) >= 5
    symbols = [i["symbol"] for i in instruments]
    assert "NIFTY50" in symbols
    assert "RELIANCE" in symbols

def test_academy_curriculum(client):
    response = client.get("/api/v1/academy/courses")
    assert response.status_code == 200
    courses = response.json()
    assert len(courses) >= 3
    slugs = [c["slug"] for c in courses]
    assert "indian-markets-foundation" in slugs

def test_ai_tutor_grounded_answer(client):
    response = client.post(
        "/api/v1/ai-tutor/query",
        json={"query": "Explain T+1 settlement and Demat"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "citations" in data
    assert len(data["citations"]) > 0
    assert "disclaimer" in data

def test_risk_position_sizing_endpoint(client):
    response = client.post(
        "/api/v1/risk/position-size",
        json={
            "account_capital": 500000.0,
            "risk_percentage": 1.5,
            "entry_price": 2500.0,
            "stop_loss_price": 2450.0
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["recommended_shares"] == 150
