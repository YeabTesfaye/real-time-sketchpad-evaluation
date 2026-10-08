from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import SQLALCHEMY_DATABASE_URL
from app.db.models import Base
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate

# Create engine and session
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)  # Ensure tables exist

db = SessionLocal()
try:
    auth_service = AuthService(db)
    user_in = UserCreate(email="test2@example.com", password="securepassword123", full_name="Test User2")
    user = auth_service.create_user(user_in)
    print(f"User created: {user.id}, {user.email}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
