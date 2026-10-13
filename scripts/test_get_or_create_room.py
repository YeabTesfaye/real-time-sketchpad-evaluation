import sys
sys.path.append('/c/Users/yeab/Documents/Claude/real-time-sketchpad-evaluation/backend')
from app.services.drawing_service import DrawingService
from app.core.database import SessionLocal

def test_get_or_create_room():
    db = SessionLocal()
    try:
        service = DrawingService(db)
        room_code = "test_room_ws_two"
        room = service.get_or_create_room(room_code)
        print(f"Room found or created: id={room.id}, room_code={room.room_code}")
        # Now query the database directly to see if it exists
        from app.db.models import Room
        room_from_db = db.query(Room).filter(Room.room_code == room_code).first()
        if room_from_db:
            print(f"Room in DB: id={room_from_db.id}, room_code={room_from_db.room_code}")
        else:
            print("Room NOT found in DB after get_or_create_room")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_get_or_create_room()