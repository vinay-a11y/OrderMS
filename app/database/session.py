from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = "mysql+pymysql://root:143%40Vinay@localhost/orderms"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,         # default is 5
    max_overflow=5,      # default is 10
    pool_timeout=30,      # wait max 30s before giving up
    pool_recycle=1800,    # recycle connections every 30 mins
    pool_pre_ping=True    # check connection before using
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

