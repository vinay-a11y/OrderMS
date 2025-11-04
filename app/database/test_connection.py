from session import engine, SessionLocal

def test_connection():
    try:
        # Try to connect directly using engine
        with engine.connect() as conn:
            result = conn.execute("SELECT DATABASE();")
            db_name = result.scalar()
            print(f"✅ Connected successfully to database: {db_name}")
    except Exception as e:
        print("❌ Connection failed:")
        print(e)

def test_session():
    try:
        db = SessionLocal()
        print("✅ Session created successfully")
        db.close()
    except Exception as e:
        print("❌ Session creation failed:")
        print(e)

if __name__ == "__main__":
    print("🔍 Testing SQLAlchemy Engine & Session...")
    test_connection()
    test_session()
