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
router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/product", response_class=HTMLResponse)
def product_page(request: Request):
     if request.cookies.get("logged_in") != "true":
      return RedirectResponse(url="/login", status_code=302)
     return templates.TemplateResponse("products.html", {"request": request})

@router.get("/product-details.html", response_class=HTMLResponse)
def product_details(request: Request):
    return templates.TemplateResponse("product-details.html", {"request": request})

@router.get("/api/products")
def get_all_products(db: Session = Depends(get_db)):
    try:
        products = db.query(Product).all()

        if not products:
            return []

        product_list = []
        for p in products:
            # Filter out None values before taking max
            price_list = [p.price_01, p.price_02, p.price_03, p.price_04]
            valid_prices = [price for price in price_list if price is not None]
            
            max_price = max(valid_prices) if valid_prices else 0  # fallback to 0 or custom default

            product_list.append({
                "id": p.id,
                "item_name": p.item_name,
                "category": p.category,
                "price_01": max_price,
                "description": p.description
            })

        return product_list

    except Exception as e:
        print("Error getting products:", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch products")

@router.get("/api/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    # print("Product found:", product)
    return {
        "id": product.id,
        "item_name": product.item_name,
        "description": product.description,
        "category": product.category,
        "price_01": product.price_01,
        "price_02": product.price_02,
        "price_03": product.price_03,
        "price_04": product.price_04,
        "packing_01": product.packing_01,
        "packing_02": product.packing_02,
        "packing_03": product.packing_03,
        "packing_04": product.packing_04,
        "shelf_life_days": product.shelf_life_days,
        "lead_time_days": product.lead_time_days,
    }