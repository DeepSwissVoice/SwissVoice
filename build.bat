echo "Simon's super starter"
@echo off
npm run-script build
cd swissvoice
docker-compose up -d --force-build
pause