from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from decimal import Decimal

from app.database import get_db
from app.models import Product, User
from app.schemas import ProductResponse
from app.auth import get_current_seller
from app.services.storage import upload_image

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def list_products(db: AsyncSession = Depends(get_db)):
    query = select(Product).order_by(Product.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan."
        )
    return product

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: Decimal = Form(...),
    stock: int = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    image_url = None
    if image:
        image_url = await upload_image(image)
        
    new_product = Product(
        seller_id=current_user.id,
        name=name,
        description=description,
        price=price,
        stock=stock,
        image_url=image_url
    )
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: Decimal = Form(...),
    stock: int = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan."
        )
    
    # Validasi kepemilikan (Data Isolation)
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda bukan pemilik produk ini."
        )
        
    product.name = name
    product.description = description
    product.price = price
    product.stock = stock
    
    if image:
        image_url = await upload_image(image)
        if image_url:
            product.image_url = image_url
            
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_200_OK)
async def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    query = select(Product).where(Product.id == product_id)
    result = await db.execute(query)
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan."
        )
        
    # Validasi kepemilikan (Data Isolation)
    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda bukan pemilik produk ini."
        )
        
    await db.delete(product)
    await db.commit()
    return {"message": "Produk berhasil dihapus."}
