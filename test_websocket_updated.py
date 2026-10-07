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
        async with websockets.connect(uri, max_size=2**20) as websocket:  # 1MB max size
            print("Connected successfully!")

            # Wait for the initial connection message (should include user info)
            response = await websocket.recv()
            print(f"Received: {response}")

            # Parse the response to get user info
            data = json.loads(response)
            if data.get("type") == "user_joined":
                print(f"User joined: {data.get('user')}")

            # Test sending a valid drawing operation
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
            print("Sent valid drawing operation")

            # Test sending an invalid drawing operation (too many points)
            invalid_drawing_op = {
                "type": "drawing_operation",
                "operation": {
                    "points": [{"x": i, "y": i} for i in range(1500)],  # Too many points
                    "color": "#ff0000",
                    "size": 2,
                    "tool": "pen"
                }
            }

            await websocket.send(json.dumps(invalid_drawing_op))
            print("Sent invalid drawing operation (too many points)")

            # Wait for error response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"Received error response: {response}")
                error_data = json.loads(response)
                if error_data.get("type") == "error":
                    print("Correctly received error for invalid operation")
            except asyncio.TimeoutError:
                print("No error response received (unexpected)")

            # Test sending a clear canvas operation
            clear_op = {
                "type": "clear_canvas"
            }

            await websocket.send(json.dumps(clear_op))
            print("Sent clear canvas operation")

            # Wait a bit to see if we get any responses
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"Received: {response}")
            except asyncio.TimeoutError:
                print("No additional messages received")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())