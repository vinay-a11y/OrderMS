 # Pydantic Schemas


from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    mobile_number: str
    password: str
    address: str

class LoginRequest(BaseModel):
    mobile_number: str
    password: str
