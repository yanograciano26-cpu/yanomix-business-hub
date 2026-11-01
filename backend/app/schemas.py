from pydantic import BaseModel, Field
from typing import Optional


class UserCreate(BaseModel):
    name: str
    email: str
    company_name: Optional[str] = None
    role: str = "user"


class UserRead(BaseModel):
    id: int
    name: str
    email: str
    company_name: Optional[str] = None
    role: str


class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryRead(BaseModel):
    id: int
    name: str
    slug: str
    description: Optional[str] = None


class AdCreate(BaseModel):
    title: str
    description: str
    category_id: int
    price: float = 0.0
    location: str
    user_id: int
    is_premium: bool = False
    is_featured: bool = False


class AdRead(BaseModel):
    id: int
    title: str
    description: str
    category_id: int
    price: float
    location: str
    user_id: int
    status: str
    is_premium: bool
    is_featured: bool
    views: int


class BusinessCreate(BaseModel):
    name: str
    owner_name: str
    category_id: int
    description: str
    website: Optional[str] = None
    city: str
    is_featured: bool = False


class BusinessRead(BaseModel):
    id: int
    name: str
    owner_name: str
    category_id: int
    description: str
    website: Optional[str]
    city: str
    is_featured: bool


class PlanRead(BaseModel):
    id: int
    name: str
    slug: str
    price: float
    currency: str
    description: str
    features: str


class PaymentCreate(BaseModel):
    user_id: int
    plan_id: int
    amount: float
    currency: str = "Kz"
    status: str = "pending"


class SupportCreate(BaseModel):
    user_email: str
    subject: str
    message: str


class AIRequest(BaseModel):
    prompt: str = Field(..., min_length=4)


class AIResponse(BaseModel):
    response: str
