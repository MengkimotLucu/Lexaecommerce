from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal

from app.database import get_db
from app.models import Cart, Product, Order, OrderItem, User
from app.schemas import OrderResponse, OrderStatusUpdate
from app.auth import get_current_user, get_current_seller
from app.services.notifications import manager

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/checkout", status_code=status.HTTP_201_CREATED)
async def checkout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # 1. Ambil isi keranjang belanja user
    cart_query = select(Cart).where(Cart.user_id == current_user.id).options(selectinload(Cart.product))
    cart_result = await db.execute(cart_query)
    cart_items = cart_result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Keranjang belanja kosong."
        )
        
    total_amount = Decimal("0.00")
    order_items_to_create = []
    
    # 2. Ambil semua product ID untuk di-lock menggunakan SELECT FOR UPDATE
    product_ids = [item.product_id for item in cart_items]
    
    # Lock product rows to prevent race condition
    # SQL: SELECT * FROM products WHERE id IN (...) FOR UPDATE
    lock_query = select(Product).where(Product.id.in_(product_ids)).with_for_update()
    lock_result = await db.execute(lock_query)
    products_db = {p.id: p for p in lock_result.scalars().all()}
    
    # 3. Validasi stok dan kurangi
    for item in cart_items:
        product = products_db.get(item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Produk ID {item.product_id} tidak ditemukan."
            )
            
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stok tidak mencukupi untuk '{product.name}'. Sisa stok: {product.stock}, diminta: {item.quantity}."
            )
            
        # Kurangi stok
        product.stock -= item.quantity
        db.add(product)
        
        # Tambah ke total
        item_price = product.price
        total_amount += item_price * item.quantity
        
        # Simpan detail item pesanan
        order_items_to_create.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price_at_purchase=item_price
            )
        )
        
    # 4. Buat objek Order baru
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        status="PENDING"
    )
    db.add(new_order)
    
    # Simpan dahulu agar memiliki ID
    await db.flush()
    
    # Hubungkan item pesanan dengan Order ID
    for order_item in order_items_to_create:
        order_item.order_id = new_order.id
        db.add(order_item)
        
    # 5. Hapus semua item di keranjang belanja pembeli
    for item in cart_items:
        await db.delete(item)
        
    # Commit transaksi (lock dilepas secara atomik)
    await db.commit()
    await db.refresh(new_order)
    
    # 6. Kirim notifikasi via WebSocket ke penjual produk jika ada (Opsional dalam lingkup multi-vendor)
    # Di sini kita fokus pada pengembalian data
    return {
        "message": "Pesanan berhasil dibuat.",
        "order_id": new_order.id,
        "total_amount": new_order.total_amount
    }

@router.get("", response_model=List[OrderResponse])
async def list_buyer_orders(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Buyer melihat riwayat pesanannya sendiri
    query = select(Order).where(Order.user_id == current_user.id).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    ).order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    response = []
    for order in orders:
        items = []
        for item in order.items:
            items.append({
                "product_id": item.product_id,
                "product_name": item.product.name if item.product else "Produk Dihapus",
                "quantity": item.quantity,
                "price_at_purchase": item.price_at_purchase
            })
            
        response.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": items
        })
    return response

@router.get("/seller", response_model=List[OrderResponse])
async def list_seller_incoming_orders(current_user: User = Depends(get_current_seller), db: AsyncSession = Depends(get_db)):
    # Seller melihat pesanan masuk yang mengandung produk miliknya
    query = select(Order).join(OrderItem).join(Product).where(
        Product.seller_id == current_user.id
    ).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    ).distinct().order_by(Order.created_at.desc())
    
    result = await db.execute(query)
    orders = result.scalars().all()
    
    response = []
    for order in orders:
        items = []
        for item in order.items:
            # Hanya tampilkan produk yang dijual oleh seller ini
            if item.product and item.product.seller_id == current_user.id:
                items.append({
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "quantity": item.quantity,
                    "price_at_purchase": item.price_at_purchase
                })
            
        response.append({
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "created_at": order.created_at,
            "items": items
        })
    return response

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    current_user: User = Depends(get_current_seller),
    db: AsyncSession = Depends(get_db)
):
    # Verifikasi status valid
    new_status = status_update.status.upper()
    if new_status not in ["PENDING", "PROCESSED", "DONE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status tidak valid. Harus PENDING, PROCESSED, atau DONE."
        )
        
    # Cari order
    query = select(Order).where(Order.id == order_id).options(
        selectinload(Order.items).selectinload(OrderItem.product)
    )
    result = await db.execute(query)
    order = result.scalars().first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pesanan tidak ditemukan."
        )
        
    # Cek apakah order mengandung produk milik seller ini
    owns_product_in_order = False
    for item in order.items:
        if item.product and item.product.seller_id == current_user.id:
            owns_product_in_order = True
            break
            
    if not owns_product_in_order:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda tidak berhak memodifikasi pesanan ini."
        )
        
    order.status = new_status
    db.add(order)
    await db.commit()
    
    # 7. Picu notifikasi real-time WebSocket ke pembeli (Buyer)
    notification_payload = {
        "type": "ORDER_STATUS_UPDATE",
        "order_id": order.id,
        "status": order.status,
        "message": f"Pesanan Anda #{order.id} telah diubah statusnya menjadi {order.status}."
    }
    await manager.send_personal_message(notification_payload, order.user_id)
    
    return {
        "message": "Status pesanan berhasil diperbarui.",
        "order_id": order.id,
        "status": order.status
    }
