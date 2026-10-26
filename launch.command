#!/bin/bash
# Se place automatiquement dans le dossier du script
cd "$(dirname "$0")"

echo "================================================================="
echo "  CLUB ROBOTIQUE — LYCÉE MODERNE 1 D'ABOBO"
echo "  DRENA : ABIDJAN 4 — RÉPUBLIQUE DE CÔTE D'IVOIRE"
echo "  Démarrage de l'application sur macOS..."
echo "================================================================="

# Vérification et lancement avec python3 ou python
if command -v python3 &>/dev/null; then
    echo "Python 3 détecté. Lancement du serveur local..."
    python3 apps.py
elif command -v python &>/dev/null; then
    echo "Python détecté. Lancement du serveur local..."
    python apps.py
else
    echo "Python non détecté. Ouverture directe dans votre navigateur..."
    open index.html
fi