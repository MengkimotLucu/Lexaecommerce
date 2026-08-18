from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List

from app.database import get_db
from app.models import Cart, Product, User
from app.schemas import CartAdd, CartUpdate, CartResponse
from app.auth import get_current_user

router = APIRouter(prefix="/carts", tags=["Carts"])

@router.get("", response_model=List[CartResponse])
async def list_cart_items(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Join Cart dengan Product untuk data katalog lengkap
    query = select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.product))
    result = await db.execute(query)
    cart_items = result.scalars().all()
    
    response = []
    for item in cart_items:
        # Jika produk sudah dihapus dari katalog, abaikan atau handle gracefully
        if not item.product:
            continue
        response.append({
            "id": item.id,
            "product_id": item.product_id,
            "product_name": item.product.name,
            "price": item.product.price,
            "quantity": item.quantity,
            "stock_available": item.product.stock,
            "image_url": item.product.image_url
        })
    return response

@router.post("", response_model=CartResponse)
async def add_to_cart(
    cart_in: CartAdd,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Cari produk
    product_query = select(Product).where(Product.id == cart_in.product_id)
    product_result = await db.execute(product_query)
    product = product_result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produk tidak ditemukan."
        )
    
    # Validasi stok
    if product.stock < cart_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stok tidak mencukupi. Stok saat ini: {product.stock}."
        )
        
    # Cek apakah produk sudah ada di keranjang user
    cart_query = select(Cart).where(
        Cart.user_id == current_user.id, 
        Cart.product_id == cart_in.product_id
    ).options(selectinload(Cart.product))
    cart_result = await db.execute(cart_query)
    cart_item = cart_result.scalars().first()
    
    if cart_item:
        # Validasi stok total
        new_qty = cart_item.quantity + cart_in.quantity
        if product.stock < new_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stok tidak mencukupi. Anda memiliki {cart_item.quantity} di keranjang, sisa stok: {product.stock}."
            )
        cart_item.quantity = new_qty
    else:
        cart_item = Cart(
            user_id=current_user.id,
            product_id=cart_in.product_id,
            quantity=cart_in.quantity
        )
        db.add(cart_item)
        
    await db.commit()
    
    # Refresh untuk memuat relasi product
    query = select(Cart).where(Cart.id == cart_item.id).options(selectinload(Cart.product))
    res = await db.execute(query)
    cart_item = res.scalars().first()
    
    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "product_name": cart_item.product.name,
        "price": cart_item.product.price,
        "quantity": cart_item.quantity,
        "stock_available": cart_item.product.stock,
        "image_url": cart_item.product.image_url
    }

@router.put("/{cart_id}", response_model=CartResponse)
async def update_cart_quantity(
    cart_id: int,
    cart_in: CartUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Cart).where(
        Cart.id == cart_id, 
        Cart.user_id == current_user.id
    ).options(selectinload(Cart.product))
    result = await db.execute(query)
    cart_item = result.scalars().first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item keranjang tidak ditemukan."
        )
        
    # Validasi stok
    if cart_item.product.stock < cart_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stok tidak mencukupi. Stok saat ini: {cart_item.product.stock}."
        )
        
    cart_item.quantity = cart_in.quantity
    db.add(cart_item)
    await db.commit()
    await db.refresh(cart_item)
    
    return {
        "id": cart_item.id,
        "product_id": cart_item.product_id,
        "product_name": cart_item.product.name,
        "price": cart_item.product.price,
        "quantity": cart_item.quantity,
        "stock_available": cart_item.product.stock,
        "image_url": cart_item.product.image_url
    }

@router.delete("/{cart_id}", status_code=status.HTTP_200_OK)
async def remove_cart_item(
    cart_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Cart).where(Cart.id == cart_id, Cart.user_id == current_user.id)
    result = await db.execute(query)
    cart_item = result.scalars().first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item keranjang tidak ditemukan."
        )
        
    await db.delete(cart_item)
    await db.commit()
    return {"message": "Item berhasil dihapus dari keranjang."}
