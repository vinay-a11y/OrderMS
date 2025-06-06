from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from app.routes import auth, products, cart, otp
from app.database.session import Base, engine
from app.models.product import Product
from fastapi.staticfiles import StaticFiles
from fastapi import Cookie
from fastapi.responses import RedirectResponse

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(otp.router)

Base.metadata.create_all(bind=engine)

@app.get("/", response_class=HTMLResponse)
def index(request: Request, logged_in: str = Cookie(default=None)):
    is_logged_in = request.cookies.get("logged_in") == "true"
    return templates.TemplateResponse("index.html", {"request": request, "is_logged_in": is_logged_in})



@app.get("/product-details.html", response_class=HTMLResponse)
def product_details(request: Request, logged_in: str = Cookie(default=None)):
    is_logged_in = request.cookies.get("logged_in") == "true"
    return templates.TemplateResponse("product-details.html", {"request": request, "is_logged_in": is_logged_in})
