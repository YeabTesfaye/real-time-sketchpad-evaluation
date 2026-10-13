import asyncio
import json
import uuid
import requests
import websockets

# Login to get a token
LOGIN_URL = "http://localhost:8000/api/v1/auth/login"
LOGIN_DATA = {
    "username": "test2@example.com",
    "password": "securepassword123"
}

def get_token():
    resp = requests.post(LOGIN_URL, data=LOGIN_DATA)
    resp.raise_for_status()
    data = resp.json()
    return data["access_token"]

# Room ID to probe
ROOM_ID = "probe_room_" + str(uuid.uuid4())[:8]

# WebSocket URL builder
def ws_url(token):
    return f"ws://localhost:8000/api/v1/ws/{ROOM_ID}?token={token}"

# Test message to send: a simple drawing operation
def test_drawing_operation(user_id):
    return {
        "type": "drawing_operation",
        "operation": {
            "points": [{"x": 100, "y": 100}, {"x": 200, "y": 200}],
            "color": "#ff0000",
            "size": 2,
            "tool": "pen",
            "userId": user_id,
            "timestamp": "2026-10-12T00:00:00Z"
        }
    }

async def client(client_id, token):
    uri = ws_url(token)
    print(f"[Client {client_id}] Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[Client {client_id}] Connected")
            # Wait a bit for connection to stabilize
            await asyncio.sleep(1)

            # Send a test message after a short delay
            await asyncio.sleep(2)
            message = test_drawing_operation(f"user_{client_id}")
            await websocket.send(json.dumps(message))
            print(f"[Client {client_id}] Sent: {message['type']}")

            # Listen for messages for 5 seconds
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    print(f"[Client {client_id}] Received: {data['type']}")
                    if data.get("type") == "drawing_operation":
                        print(f"[Client {client_id}]  Drawing operation from user: {data['operation'].get('userId')}")
            except asyncio.TimeoutError:
                print(f"[Client {client_id}] Timeout waiting for messages")
    except Exception as e:
        print(f"[Client {client_id}] Error: {e}")

async def main():
    token = get_token()
    print(f"Got token: {token[:20]}...")

    # Run two clients concurrently
    await asyncio.gather(
        client(1, token),
        client(2, token)
    )

if __name__ == "__main__":
    asyncio.run(main())