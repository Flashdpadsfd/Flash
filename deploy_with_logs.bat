@echo off
setlocal enabledelayedexpansion

REM ===== CONFIGURATION DES LOGS =====
set "LOG_DIR=logs"
set "YEAR=%date:~-4,4%"
set "MONTH=%date:~-10,2%"
set "DAY=%date:~-7,2%"
set "HOUR=%time:~0,2%"
set "MINUTE=%time:~3,2%"
set "SECOND=%time:~6,2%"
set "HOUR=%HOUR: =0%"
set "LOG_FILE=%LOG_DIR%\deploy_%YEAR%%MONTH%%DAY%_%HOUR%%MINUTE%%SECOND%.log"
set "SUMMARY_FILE=%LOG_DIR%\deploy_summary.txt"

REM Créer le dossier logs s'il n'existe pas
if not exist "%LOG_DIR%" (
    mkdir "%LOG_DIR%"
    echo Dossier logs cree
)

REM Fonction pour écrire dans les logs
goto :start

:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo %~1
goto :eof

:start
call :log "========================================="
call :log "DEPLOIEMENT DEMARRE"
call :log "========================================="

echo.
echo  Deploiement en cours...
echo.

REM Se placer dans le bon répertoire
cd /d "%~dp0"
call :log "Repertoire de travail: %CD%"

REM Vérifier le statut git avant
call :log "Verification du statut git..."
git status --short >> "%LOG_FILE%" 2>&1

REM Ajouter tous les fichiers
call :log "Ajout de tous les fichiers..."
git add . >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% neq 0 (
    call :log "ERREUR: Impossible d'ajouter les fichiers"
    goto :error
)
call :log "Fichiers ajoutes avec succes"

REM Demander le message de commit
set /p msg="Decris ta modification (optionnel) : "
if "%msg%"=="" set msg=mise a jour
call :log "Message de commit: %msg%"

REM Faire le commit
call :log "Creation du commit..."
git commit -m "%msg%" >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% neq 0 (
    call :log "ATTENTION: Rien a commiter ou erreur de commit"
    echo Rien a commiter ou erreur - verifiez les logs
)

REM Push vers le repository
call :log "Envoi vers GitHub (branch master)..."
git push origin master >> "%LOG_FILE%" 2>&1
if %ERRORLEVEL% neq 0 (
    call :log "ERREUR: Impossible de pousser vers GitHub"
    goto :error
)
call :log "Push reussi vers GitHub"

REM Obtenir le hash du dernier commit
for /f "tokens=*" %%i in ('git rev-parse --short HEAD') do set COMMIT_HASH=%%i
call :log "Hash du commit: %COMMIT_HASH%"

REM Obtenir l'URL du repository
for /f "tokens=*" %%i in ('git config --get remote.origin.url') do set REPO_URL=%%i
call :log "Repository: %REPO_URL%"

REM Ajouter au fichier de résumé
echo ===== %date% %time% ===== >> "%SUMMARY_FILE%"
echo Commit: %COMMIT_HASH% >> "%SUMMARY_FILE%"
echo Message: %msg% >> "%SUMMARY_FILE%"
echo Status: SUCCESS >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"

call :log "========================================="
call :log "DEPLOIEMENT TERMINE AVEC SUCCES"
call :log "========================================="
call :log "Log complet: %LOG_FILE%"

echo.
echo  Termine ! Vercel va se mettre a jour dans 1-2 minutes.
echo  Log sauvegarde dans: %LOG_FILE%
echo.
pause
exit /b 0

:error
call :log "========================================="
call :log "DEPLOIEMENT ECHOUE"
call :log "========================================="

REM Ajouter au fichier de résumé
echo ===== %date% %time% ===== >> "%SUMMARY_FILE%"
echo Status: FAILED >> "%SUMMARY_FILE%"
echo Message: %msg% >> "%SUMMARY_FILE%"
echo. >> "%SUMMARY_FILE%"

echo.
echo  ERREUR lors du deploiement!
echo  Consultez le log: %LOG_FILE%
echo.
pause
exit /b 1