import asyncio
import websockets
import json
import uuid

async def test_websocket():
    # Generate a room ID and user ID for testing
    room_id = "test-room-123"
    user_id = str(uuid.uuid4())

    # Connect to the WebSocket
    uri = f"ws://localhost:8000/ws/{room_id}"
    print(f"Connecting to {uri}")

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")

            # Wait for the initial connection message (should include user info)
            response = await websocket.recv()
            print(f"Received: {response}")

            # Parse the response to get user info
            data = json.loads(response)
            if data.get("type") == "user_joined":
                print(f"User joined: {data.get('user')}")

            # Test sending a drawing operation
            drawing_op = {
                "type": "drawing_operation",
                "operation": {
                    "points": [{"x": 10, "y": 20}, {"x": 15, "y": 25}, {"x": 20, "y": 30}],
                    "color": "#ff0000",
                    "size": 2,
                    "tool": "pen"
                }
            }

            await websocket.send(json.dumps(drawing_op))
            print("Sent drawing operation")

            # Wait for the broadcast of our drawing operation (should be echoed back to others, not us)
            # Actually, we won't receive our own operation back due to exclude_user logic
            # But we should receive other types of messages

            # Test sending a cursor move
            cursor_move = {
                "type": "cursor_move",
                "position": {"x": 100, "y": 200}
            }

            await websocket.send(json.dumps(cursor_move))
            print("Sent cursor move")

            # Wait a bit to see if we get any responses
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"Received: {response}")
            except asyncio.TimeoutError:
                print("No additional messages received (expected for single client test)")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())