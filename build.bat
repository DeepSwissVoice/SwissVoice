@echo off
echo ^+----------------------------------------^+
echo ^|         Simon's super starter          ^|
echo ^|========================================^|
echo ^|  - Building static files...            ^|
call npm run-script build >nul
echo ^|  - Server static files built           ^|
echo ^|  - Composing Container...              ^|
cd server
docker-compose up -d --build >nul 2>&1
echo ^|  - Docker Container should be running! ^|
pause
