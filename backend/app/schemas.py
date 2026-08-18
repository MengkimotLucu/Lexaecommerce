from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from decimal import Decimal
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: str = "buyer"  # "buyer" atau "seller"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    store_name: Optional[str] = None
    store_description: Optional[str] = None
    store_image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None

class StoreUpdate(BaseModel):
    store_name: str = Field(..., min_length=2, max_length=100)
    store_description: Optional[str] = None

# Product Schemas
class ProductResponse(BaseModel):
    id: int
    seller_id: int
    name: str
    description: Optional[str] = None
    price: Decimal
    stock: int
    image_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Cart Schemas
class CartAdd(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class CartUpdate(BaseModel):
    quantity: int = Field(..., gt=0)

class CartResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    price: Decimal
    quantity: int
    stock_available: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

# Order Schemas
class OrderItemResponse(BaseModel):
    product_id: Optional[int]
    product_name: Optional[str]
    quantity: int
    price_at_purchase: Decimal

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    total_amount: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str  # PENDING, PROCESSED, DONE
