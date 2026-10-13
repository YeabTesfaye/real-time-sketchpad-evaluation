import asyncio
import json
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
    return resp.json()["access_token"]

async def test_connection():
    token = get_token()
    print(f"Token: {token[:20]}...")
    room_id = "test_room_ws"
    uri = f"ws://localhost:8000/api/v1/ws/{room_id}?token={token}"
    print(f"Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected")
            # Wait for a message for 5 seconds
            try:
                while True:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(response)
                    print(f"Received: {data}")
                    # If we get a canvas_state or user_joined, we can break
                    if data.get("type") in ("canvas_state", "user_joined"):
                        break
            except asyncio.TimeoutError:
                print("Timeout waiting for messages")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())