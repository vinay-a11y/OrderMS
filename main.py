from fastapi import FastAPI, Request, Cookie
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

# Route Imports
from app.routes import auth, products, cart, otp, payment, admins

# Database setup
from app.database.session import Base, engine
from app.models.product import Product  # Ensures model is registered

# Initialize FastAPI
app = FastAPI()

# ✅ CORS Middleware (FIXED)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://192.168.0.237:8000",
        "http://139.59.2.94:8000",
        "http://139.59.2.94:3000", # ✅ If frontend served from port 8000 on droplet
        "http://139.59.2.94",        # ✅ If served directly (e.g., static HTML)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static and Template Setup
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Register Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(payment.router)
app.include_router(otp.router)
app.include_router(admins.router)

# Create database tables
Base.metadata.create_all(bind=engine)

# Default route
@app.get("/", response_class=HTMLResponse)
def index(request: Request, logged_in: str = Cookie(default=None)):
    is_logged_in = request.cookies.get("logged_in") == "true"
    return templates.TemplateResponse("products.html", {"request": request, "is_logged_in": is_logged_in})

