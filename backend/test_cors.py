import httpx
import asyncio

async def main():
    async with httpx.AsyncClient() as client:
        res = await client.get('http://localhost:8000/api/portfolio/about', headers={'Origin': 'http://localhost:5174'})
        print(res.headers)

asyncio.run(main())
