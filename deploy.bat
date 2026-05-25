@echo off
echo.
echo  Deploiement en cours...
echo.

cd /d "%~dp0"

git add .

set /p msg="Decris ta modification (optionnel) : "

if "%msg%"=="" set msg=mise a jour

git commit -m "%msg%"

git push origin master

echo.
echo  Termine ! Vercel va se mettre a jour dans 1-2 minutes.
echo.
pause
