from fastapi import APIRouter, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from app.database.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.models.product import Product
from app.schemas.product import ProductCreate
from fastapi.responses import RedirectResponse
from app.models.orders import Order
from typing import List
from app.schemas.orders import OrderStatusUpdate

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# @router.get("/admin", response_class=HTMLResponse)
# def admin_page(request: Request):

#     if request.cookies.get("logged_in") != "true" :
#       return RedirectResponse(url="/login", status_code=302)
#     return templates.TemplateResponse("admin.html", {"request": request})

@router.get("/admin", response_class=HTMLResponse)
def admin_page(request: Request):
    if request.cookies.get("logged_in") != "true":
        return RedirectResponse(url="/login", status_code=302)
    print("✔ Admin route hit")
    user_role = request.cookies.get("user_role")
    if user_role != "admin":
        return HTMLResponse(content="Unauthorized", status_code=403)
    
    return templates.TemplateResponse("admin.html", {"request": request})

# @router.get("/admin/products")
# def admin_products(request: Request, db: Session = Depends(get_db)):
#     orders = db.query(Order).all()
#     return orders

# @router.get("/api/admin/orders", response_class=HTMLResponse)
# def admin_products(request: Request, db: Session = Depends(get_db)):
#     if request.cookies.get("logged_in") != "true":
#       return RedirectResponse(url="/login", status_code=302)
#     orders = db.query(Order).all()
#     return orders

@router.get("/api/admin/orders")
def get_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).all()
    return orders 

@router.patch("/api/admin/orders/{order_id}")
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.order_status = payload.order_status
    db.commit()
    db.refresh(order)
    return order