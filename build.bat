@echo off
echo ^+----------------------------------------^+
echo ^|         Simon's super starter          ^|
echo ^|========================================^|
echo ^|  - Building static files...            ^|
@start /b cmd /c tools\jinjer\jinjer.exe src/html server/swissvoice/static >nul
echo ^|    * html built                        ^|
@start /b cmd /c tools\sassier\sassier.exe src/css server/swissvoice/static/css >nul
echo ^|    * css built                         ^|
call npm run-script build >nul
echo ^|    * js built                          ^|
echo ^|  - Server static files built           ^|
echo ^|  - Composing Container...              ^|
cd server
docker-compose up -d --build >nul 2>&1
echo ^|  - Docker Container should be running! ^|
pause