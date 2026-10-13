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

async def client(client_id, token, send_after=None):
    room_id = "test_room_ws_two"
    uri = f"ws://localhost:8000/api/v1/ws/{room_id}?token={token}"
    print(f"[Client {client_id}] Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[Client {client_id}] Connected")
            # Wait a bit for connection to stabilize
            await asyncio.sleep(1)

            # If we are supposed to send a message after a delay, wait and send
            if send_after is not None:
                await asyncio.sleep(send_after)
                message = {
                    "type": "drawing_operation",
                    "operation": {
                        "points": [{"x": 100, "y": 100}, {"x": 200, "y": 200}],
                        "color": "#ff0000",
                        "size": 2,
                        "tool": "pen"
                    }
                }
                await websocket.send(json.dumps(message))
                print(f"[Client {client_id}] Sent drawing_operation")

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
    token = get_token()
    print(f"Got token: {token[:20]}...")

    # Run two clients: client 1 sends after 2 seconds, client 2 just listens
    await asyncio.gather(
        client(1, token, send_after=2),
        client(2, token, send_after=None)
    )

if __name__ == "__main__":
    asyncio.run(main())