import asyncio
import websockets
import json

ROOM_ID = "EEDB6B3B"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjM2M4MjFjNi1lYzJmLTQ3OWYtYjk0MC05Y2MxY2QxZDE0YTAiLCJleHAiOjE3OTIwMzgzODV9.FNYvpP2WwToeZTThCq3Cv2UZkWz6IIT9-IOkYKMJSPo"

async def test_websocket():
    uri = (
        f"ws://localhost:8000/api/v1/ws/{ROOM_ID}"
        f"?token={TOKEN}"
    )

    print(f"Connecting to {uri.split('?')[0]}")

    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")

            # Your server may send canvas_state if drawing history exists.
            # Otherwise, it may send no initial message.
            try:
                response = await asyncio.wait_for(
                    websocket.recv(),
                    timeout=2.0
                )
                print("Initial message:", response)
            except asyncio.TimeoutError:
                print("No initial message received.")

            drawing_op = {
                "type": "drawing_operation",
                "operation": {
                    "points": [
                        {"x": 10, "y": 20},
                        {"x": 15, "y": 25},
                        {"x": 20, "y": 30}
                    ],
                    "color": "#ff0000",
                    "size": 2,
                    "tool": "pen"
                }
            }

            await websocket.send(json.dumps(drawing_op))
            print("Drawing operation sent.")

            cursor_move = {
                "type": "cursor_move",
                "position": {"x": 100, "y": 200}
            }

            await websocket.send(json.dumps(cursor_move))
            print("Cursor movement sent.")

            # The server broadcasts these events to other clients,
            # not back to this sender.
            print("Single-client test completed.")

    except websockets.exceptions.InvalidStatus as e:
        print(f"Connection rejected by server: {e}")
    except Exception as e:
        print(f"WebSocket test failed: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())