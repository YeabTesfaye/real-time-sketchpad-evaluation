from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_signup_and_login():
    # Test signup
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "securepassword123",
            "full_name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]

    # Test login with the same credentials
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "securepassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    # The token should be the same or a new one (both are valid)
    # We can just check that we got a token

    # Test login with wrong password
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401

    # Test signup with existing email
    response = client.post(
        "/api/v1/auth/signup",
        json={
            "email": "test@example.com",
            "password": "anotherpassword",
            "full_name": "Another User"
        }
    )
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]