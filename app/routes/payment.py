# main.py
from fastapi import APIRouter, HTTPException, Request

import razorpay
import os

router = APIRouter()

# Allow frontend access (adjust for your frontend domain)


# Razorpay test keys
RAZORPAY_KEY_ID = "rzp_test_m5j63eVkzEwHxa"
RAZORPAY_KEY_SECRET = "45ZCZTvLVb2GjiKo2n9meKTB"

# Razorpay client
razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


@router.post("/create-order/")
async def create_order(data: dict):
    try:
        amount_in_paise = data.get("amount") * 100  # Razorpay uses paise
        payment = razorpay_client.order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": 1,
        })
        return {"order_id": payment['id'], "key": RAZORPAY_KEY_ID}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-payment/")
async def verify_payment(request: Request):
    data = await request.json()
    try:
        params_dict = {
            'razorpay_order_id': data['order_id'],
            'razorpay_payment_id': data['payment_id'],
            'razorpay_signature': data['signature']
        }

        # Verify the payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)
        return {"status": "success", "message": "Payment verified"}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Payment verification failed")