# models.py (or wherever Order is defined)
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database.session import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(100), nullable=True)   # NEW
    phone = Column(String(20), nullable=True)   # NEW
    address = Column(JSON)
    items = Column(JSON)
    total_amount = Column(Float)
    order_status = Column(String(20), default="placed")
    razorpay_order_id = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="orders")

