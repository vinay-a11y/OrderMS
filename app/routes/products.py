from fastapi import APIRouter,Body, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from fastapi import Request
from app.database.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from app.models.product import Product
from app.schemas.product import ProductsCreate  ,ProductCreate   
from fastapi.responses import RedirectResponse
router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/product", response_class=HTMLResponse)
def product_page(request: Request):
    #  if request.cookies.get("logged_in") != "true":
    #   return RedirectResponse(url="/login", status_code=302)
     return templates.TemplateResponse("products.html", {"request": request})

@router.get("/product-details.html", response_class=HTMLResponse)
def product_details(request: Request):
    return templates.TemplateResponse("product-details.html", {"request": request})

@router.get("/api/products")
def get_all_products(db: Session = Depends(get_db)):
    try:
        products = db.query(Product).all()
        product_list = []

        for p in products:
            variants = []
            if p.price_01 is not None:
                variants.append({"packing": p.packing_01 or "Var 1", "price": p.price_01})
            if p.price_02 is not None:
                variants.append({"packing": p.packing_02 or "Var 2", "price": p.price_02})
            if p.price_03 is not None:
                variants.append({"packing": p.packing_03 or "Var 3", "price": p.price_03})
            if p.price_04 is not None:
                variants.append({"packing": p.packing_04 or "Var 4", "price": p.price_04})

            max_price = max((v["price"] for v in variants), default=0)

            product_list.append({
                "id": p.id,
                "item_name": p.item_name,
                "category": p.category,
                "description": p.description,
                "image_url": p.imagesrc,
                "variants": variants,
                "max_price": max_price,
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
        "image_url": product.imagesrc 
    }

@router.post("/api/products/add")
def add_product(
    product: ProductsCreate = Body(...),  # ⬅️ use ProductsCreate (no ID)
    db: Session = Depends(get_db),
):
    try:
        new_product = Product(
            item_name=product.item_name,
            category=product.category,
            description=product.description,
            shelf_life_days=product.shelf_life_days,
            lead_time_days=product.lead_time_days,
            imagesrc=product.imagesrc,
            packing_01=product.packing_01,
            price_01=product.price_01,
            packing_02=product.packing_02,
            price_02=product.price_02,
            packing_03=product.packing_03,
            price_03=product.price_03,
            packing_04=product.packing_04,
            price_04=product.price_04,
        )

        db.add(new_product)
        db.commit()
        db.refresh(new_product)

        return {"message": "Product added successfully", "product_id": new_product.id}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to add product: {str(e)}")

@router.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
        return {"message": f"Product with ID {product_id} deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete product: {str(e)}")
