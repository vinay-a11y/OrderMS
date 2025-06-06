from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, List
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from app.database.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.models.product import Product
from app.schemas.product import ProductCreate
from fastapi.responses import RedirectResponse
from fastapi import Cookie

# router = APIRouter(prefix="/api/cart", tags=["cart"])
router = APIRouter()
templates = Jinja2Templates(directory="templates")


@router.get("/cart", response_class=HTMLResponse)
def cart(request: Request, logged_in: str = Cookie(default=None)):
    if request.cookies.get("logged_in") != "true":
      return RedirectResponse(url="/login", status_code=302)
    return templates.TemplateResponse("cart.html", {"request": request})

@router.post("/api/cart/sync")
async def sync_cart(cart_data: Dict[str, List]):
    """
    Sync the cart data with the server.
    This endpoint accepts the cart data and could be used to:
    1. Save the cart state for the user
    2. Validate product availability
    3. Apply any server-side cart rules
    
    For now, it just accepts the data and returns success.
    """
    try:
        # In a real application, we would:
        # 1. Validate all products exist and are available
        # 2. Update any prices if they've changed
        # 3. Save the cart state to the database
        # 4. Apply any promotions or discounts
        # 5. Return the validated/modified cart
        
        return {
            "status": "success",
            "message": "Cart synced successfully",
            "data": cart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
