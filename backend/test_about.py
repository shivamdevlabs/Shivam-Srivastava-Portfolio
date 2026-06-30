import asyncio
from database import get_db
from routers.portfolio_router import get_about

async def main():
    try:
        res = await get_about()
        print("RESULT:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
