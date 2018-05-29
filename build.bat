echo "Simon's super starter"
@echo off
call npm run-script build
cd swissvoice
docker-compose up -d --build
pause