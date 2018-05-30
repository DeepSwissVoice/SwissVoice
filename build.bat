echo "Simon's super starter"
@echo off
call npm run-script build
cd server
docker-compose up -d --build
pause
