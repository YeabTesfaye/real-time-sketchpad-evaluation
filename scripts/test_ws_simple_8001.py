import asyncio
import json
import requests
import websockets
import random
import string

# Login to get a token
LOGIN_URL = "http://localhost:8001/api/v1/auth/login"
LOGIN_DATA = {
    "username": "test2@example.com",
    "password": "securepassword123"
}
SIGNUP_URL = "http://localhost:8001/api/v1/auth/signup"

def get_token():
    resp = requests.post(LOGIN_URL, data=LOGIN_DATA)
    resp.raise_for_status()
    return resp.json()["access_token"]

def signup_user():
    # Generate random email
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    email = f"test{random_suffix}@example.com"
    payload = {
        "email": email,
        "firstname": "Test",
        "lastname": "User",
        "password": "securepassword123"
    }
    resp = requests.post(SIGNUP_URL, json=payload)
    resp.raise_for_status()
    return resp.json()["access_token"], email

async def client(client_id, token, send_after=None):
    room_id = "test_room_ws_simple_8001"
    uri = f"ws://localhost:8001/api/v1/ws/{room_id}?token={token}"
    print(f"[Client {client_id}] Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[Client {client_id}] Connected")
            await asyncio.sleep(1)

            if send_after is not None:
                await asyncio.sleep(send_after)
                message = {
                    "type": "drawing_operation",
                    "operation": {
                        "points": [{"x": 100, "y": 100}],  # Single point
                        "color": "#ff0000",
                        "size": 2,
                        "tool": "pen"
                    }
                }
                await websocket.send(json.dumps(message))
                print(f"[Client {client_id}] Sent drawing_operation with single point")

            # Listen for messages for 10 seconds
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=10.0)
                    data = json.loads(response)
                    print(f"[Client {client_id}] Received: {data['type']}")
                    if data.get("type") == "drawing_operation":
                        print(f"[Client {client_id}]  Drawing operation from user: {data['operation'].get('userId')}")
            except asyncio.TimeoutError:
                print(f"[Client {client_id}] Timeout waiting for messages")
    except Exception as e:
        print(f"[Client {client_id}] Error: {e}")

async def main():
    # Get token for user 1 (existing user)
    token1 = get_token()
    print(f"Got token 1: {token1[:20]}...")

    # Get token for user 2 (newly created user)
    token2, email = signup_user()
    print(f"Got token 2: {token2[:20]}... for email {email}")

    # Run two clients: client 1 sends after 2 seconds, client 2 just listens
    await asyncio.gather(
        client(1, token1, send_after=2),
        client(2, token2, send_after=None)
    )

if __name__ == "__main__":
    asyncio.run(main())