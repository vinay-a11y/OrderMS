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

# @router.get("/product-details",response_class=HTMLResponse)
# def list_products(request: Request, db: Session = Depends(get_db)):
#    return templates.TemplateResponse("product-details.html", {"request": request})



@router.get("/api/products", response_model=list[ProductCreate])
def get_all_products(db: Session = Depends(get_db)):
    try:
        products = db.query(Product).all()
        # print("Products from DB:", products)
        if not products:
            # print("No products found in DB")
            return []
        
        # Convert to dict for better debug visibility
        product_list = [
            {
                "id": p.id,
                "item_name": p.item_name,
                "category": p.category,
                "price_01": p.price_01,
                "description": p.description
            } for p in products
        ]
        # print("Returning products:", product_list)
        return products
    except Exception as e:
        print("Error getting products:", str(e))
        raise


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