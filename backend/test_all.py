import asyncio
import httpx

async def main():
    async with httpx.AsyncClient() as client:
        endpoints = [
            '/portfolio/about',
            '/portfolio/projects',
            '/portfolio/graphic-designs',
            '/portfolio/experience',
            '/portfolio/education',
            '/portfolio/certificates',
            '/portfolio/skills'
        ]
        for ep in endpoints:
            url = f"http://localhost:8000/api{ep}"
            res = await client.get(url)
            print(f"{ep}: {res.status_code}")

asyncio.run(main())
