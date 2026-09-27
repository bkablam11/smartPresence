@echo off
title Club Robotique - Lycee Moderne 1 Abobo
echo =================================================================
echo   CLUB SCIENTIFIQUE ET ROBOTIQUE - LYCEE MODERNE 1 D'ABOBO
echo   DRENA : ABIDJAN 4 - REPUBLIQUE DE COTE D'IVOIRE
echo =================================================================
echo.
echo Demarrage de l'application hors-ligne...

:: Verifie si Python est installe
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Python detecte. Lancement via le serveur local optimise...
    python launcher.py
) else (
    echo Python non detecte. Ouverture directe dans votre navigateur par defaut...
    start index.html
)
