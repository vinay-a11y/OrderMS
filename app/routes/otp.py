# paste the whatsapp code here 
from fastapi import HTTPException, APIRouter
from twilio.rest import Client
from app.schemas.otp import PhoneNumberRequest, VerifyRequest

router = APIRouter()

# Twilio credentials
# TWILIO_ACCOUNT_SID = 'ACe4165e205092a04a6e2d40cac9fe1a14'
# TWILIO_AUTH_TOKEN = 'a0fe561bf509fc2c3d31525da70bfecd'
# VERIFY_SERVICE_SID = 'VA200c6d672edbbf301ec6cbab7fe15751'

TWILIO_ACCOUNT_SID = "ACc571cbdb25cd9a2f9582b903854c6fd7"
TWILIO_AUTH_TOKEN= "9bbf0ed7d087685144877762b788450a"
VERIFY_SERVICE_SID= "VA09f68c14bb71026011dfd4828393708a"

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)



@router.post("/send-otp")
def send_otp(data: PhoneNumberRequest):
    try:
        verification = client.verify.services(VERIFY_SERVICE_SID).verifications.create(
            to=data.phone,
            channel="sms"  
        )
        return {"status": verification.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-otp")
def verify_otp(data: VerifyRequest):
    try:
        verification_check = client.verify.services(VERIFY_SERVICE_SID).verification_checks.create(
            to=data.phone,
            code=data.code
        )
        if verification_check.status == "approved":
            return {"status": "verified"}
        else:
            return {"status": verification_check.status}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Verification failed")