from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.notifications import manager

router = APIRouter(prefix="/ws", tags=["WebSockets"])

@router.websocket("/notifications/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Menjaga koneksi tetap terbuka dengan mendengarkan pesan dari client
            data = await websocket.receive_text()
            # (Saat ini client hanya mendengarkan, tidak ada aksi atas input client)
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
