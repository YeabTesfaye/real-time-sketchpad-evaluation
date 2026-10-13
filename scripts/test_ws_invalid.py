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

async def client(client_id, token):
    room_id = "test_room_ws_invalid"
    uri = f"ws://localhost:8000/api/v1/ws/{room_id}?token={token}"
    print(f"[Client {client_id}] Connecting to {uri}")
    try:
        async with websockets.connect(uri) as websocket:
            print(f"[Client {client_id}] Connected")
            await asyncio.sleep(1)

            # Send an invalid message type
            message = {
                "type": "invalid_type",
                "foo": "bar"
            }
            await websocket.send(json.dumps(message))
            print(f"[Client {client_id}] Sent invalid_type")

            # Wait for a response for 5 seconds
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                print(f"[Client {client_id}] Received: {data}")
            except asyncio.TimeoutError:
                print(f"[Client {client_id}] Timeout waiting for response")
    except Exception as e:
        print(f"[Client {client_id}] Error: {e}")

async def main():
    token = get_token()
    print(f"Got token: {token[:20]}...")

    await client(1, token)

if __name__ == "__main__":
    asyncio.run(main())