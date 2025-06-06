#SQLAlchemy Models
from sqlalchemy import Column, Integer, String
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    mobile_number = Column(String(15))
    password = Column(String(255))
    address = Column(String(255))
    customer_id = Column(String(20), unique=True, index=True)
    internal_id = Column(String(36), unique=True)
