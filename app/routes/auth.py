from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi import Response, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.models.user import User
from app.database.session import get_db
from app.schemas.user import ResetPasswordRequest, UserAddressUpdate, Address
from sqlalchemy.orm.attributes import flag_modified

router = APIRouter()
templates = Jinja2Templates(directory="templates")

@router.get("/register", response_class=HTMLResponse)
def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
async def register(
    firstName: str = Form(...),
    lastName: str = Form(...),
    phone: str = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...),
    db: Session = Depends(get_db)
):
    if password != confirmPassword:
        return {"error": "Passwords do not match"}

    user = User(
        first_name=firstName,
        last_name=lastName,
        mobile_number=phone,
        password=password,
        customer_id=str(uuid4())[:8],
        internal_id=str(uuid4())
    )
    try:
        db.add(user)
        db.commit()
        response = RedirectResponse(url="/login", status_code=303)
        return response
    except Exception as e:
        db.rollback()
        return JSONResponse(
            status_code=500,
            content={"message": "Registration failed: " + str(e)}
        ) 

@router.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    print("✔ Login route hit")
    return templates.TemplateResponse("login.html", {"request": request})

# @router.post("/login")
# def login(
#     mobile_number: str = Form(...),
#     password: str = Form(...),
#     db: Session = Depends(get_db)
# ):
#     user = db.query(User).filter(
#         User.mobile_number == mobile_number,
#         User.password == password
#     ).first()

#     print("✔ Login successful",user.role)
#     if user and user.role == "admin":
#         response = RedirectResponse(url="/admin", status_code=201)
#         return response
    
#     if user:
#         # Return user data in response
#         response = JSONResponse(content={
#             "message": "Login successful",
#             "user": {
#                 "first_name": user.first_name,
#                 "id": user.id,
#                 # "mobile_number": user.mobile_number,
#                 # "email": user.email
#             }
#         })
#         response.set_cookie(key="logged_in", value="true", httponly=True)
#         response.set_cookie(key="user_role", value=user.role, httponly=True)
#         print("✔ Login successful")
#         return response

#     return JSONResponse(content={"detail": "Invalid credentials"}, status_code=401)

@router.post("/login")
def login(
    mobile_number: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.mobile_number == mobile_number).first()

    if not user or user.password != password:  # replace with hashed password check
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Set cookies and return success
    response = JSONResponse(content={
        "message": "Login successful",
        "user": {
            "first_name": user.first_name,
            "role": user.role,
            "id": user.id
        }
    })

    response.set_cookie("logged_in", "true", httponly=True, secure=True)
    response.set_cookie("user_role", user.role, httponly=True, secure=True)

    return response

@router.get("/logout")
def logout():
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie(key="logged_in")
    return response

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    print(req)
    user = db.query(User).filter(User.mobile_number == req.phone).first()
    if user:
        user.password = req.newPassword
        db.add(user)
        db.commit()
        return JSONResponse(content={"message": "Password reset successful"})
    return JSONResponse(content={"detail": "Invalid credentials"}, status_code=401)

@router.get("/api/user/addresses")
def get_user_saved_address(id: int, db: Session = Depends(get_db)):
    """Get all addresses for a user - FIXED"""
    # print(f"Getting addresses for user ID: {id}")
    
    user = db.query(User).filter(User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle case where address is None or empty
    addresses = user.address if user.address else []
    print(f"Found addresses: {addresses}")
    
    return JSONResponse(content={
        "addresses": addresses,
        "count": len(addresses)
    })

@router.post("/api/user/address")
async def save_user_address(payload: UserAddressUpdate, db: Session = Depends(get_db)):
    """Save a new address for user - FIXED to properly handle multiple addresses"""
    print("Received payload:", payload.model_dump())

    user_id = payload.id
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Initialize address list if None
    if user.address is None:
        user.address = []

    new_address = payload.address.model_dump()
    print("Adding address:", new_address)

    # Check for duplicate addresses based on line1 and pincode
    existing_addresses = user.address or []
    is_duplicate = any(
        addr.get("line1") == new_address.get("line1") and 
        addr.get("pincode") == new_address.get("pincode")
        for addr in existing_addresses
    )

    if is_duplicate:
        print("Duplicate address found. Skipping.")
        return JSONResponse(content={
            "message": "Address already exists", 
            "addresses": user.address
        })

    # Add new address to the list
    user.address.append(new_address)
    
    # Mark the field as modified for SQLAlchemy
    flag_modified(user, "address")
    
    try:
        db.commit()
        db.refresh(user)
        print("Address saved successfully to database")
        
        return JSONResponse(content={
            "message": "Address saved successfully", 
            "addresses": user.address
        })
    except Exception as e:
        db.rollback()
        print(f"Error saving address: {e}")
        raise HTTPException(status_code=500, detail="Failed to save address")

@router.delete("/api/user/address")
async def delete_user_address(address_id: int, user_id: int, db: Session = Depends(get_db)):
    print("Deleting address with ID:", address_id)
    """Delete a specific address - IMPROVED"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.address:
        # Remove address with matching ID
        user.address = [addr for addr in user.address if addr.get("id") != address_id]
        flag_modified(user, "address")
        db.commit()
    
    return JSONResponse(content={"message": "Address deleted successfully"})

@router.put("/api/user/address/{address_id}")
async def update_user_address(address_id: int, address: Address, user_id: int, db: Session = Depends(get_db)):
    """Update a specific address - IMPROVED"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.address:
        # Find and update the address
        for i, addr in enumerate(user.address):
            if addr.get("id") == address_id:
                user.address[i] = address.model_dump()
                flag_modified(user, "address")
                db.commit()
                break
    
    return JSONResponse(content={"message": "Address updated successfully"})
