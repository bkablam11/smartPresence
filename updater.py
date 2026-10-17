"""
Module d'Auto-Update GitHub pour smartPresence (Club Robotique Abobo)
Fonctionne avec la bibliothèque standard Python (aucune dépendance externe).
"""

import os
import sys
import json
import urllib.request
import subprocess
import tempfile
import time

# ⚙️ CONFIGURATION DU PROJET (À ADAPTER AVEC VOTRE DÉPÔT GITHUB)
GITHUB_REPO = "bkablam11/smartPresence"  # Ex: "moncompte/smartPresence"
CURRENT_VERSION = "2.2.0"                        # Version actuelle du logiciel
EXE_NAME = "ClubRobotique_Abobo.exe"            # Nom de votre exécutable PyInstaller


def get_latest_release_info():
    """Interroge l'API GitHub pour obtenir la dernière release publiée."""
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
    headers = {
        "User-Agent": "smartPresence-Updater",
        "Accept": "application/vnd.github.v3+json"
    }

    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                data = json.loads(response.read().decode("utf-8"))
                tag_name = data.get("tag_name", "").lstrip("v")
                body = data.get("body", "Améliorations et corrections de bugs.")
                
                # Recherche de l'exécutable dans les assets attachés
                download_url = None
                for asset in data.get("assets", []):
                    if asset.get("name") == EXE_NAME or asset.get("name").endswith(".exe"):
                        download_url = asset.get("browser_download_url")
                        break
                
                is_newer = compare_versions(tag_name, CURRENT_VERSION) > 0
                return {
                    "success": True,
                    "update_available": is_newer,
                    "latest_version": tag_name,
                    "current_version": CURRENT_VERSION,
                    "notes": body,
                    "download_url": download_url
                }
    except Exception as e:
        return {"success": False, "error": str(e), "update_available": False}

    return {"success": False, "update_available": False}


def compare_versions(v1, v2):
    """Compare deux versions numériques (ex: 2.2.0 vs 2.1.0). Retourne > 0 si v1 > v2."""
    def parse_v(v):
        return [int(x) for x in v.split(".") if x.isdigit()]
    try:
        p1 = parse_v(v1)
        p2 = parse_v(v2)
        return (p1 > p2) - (p1 < p2)
    except Exception:
        return 0


def apply_update(download_url):
    """Télécharge la nouvelle version et programme le remplacement."""
    if not download_url:
        return False, "Aucun lien de téléchargement valide trouvé."

    try:
        # 1. Détermine le fichier cible (le .exe actuel ou le script)
        is_frozen = getattr(sys, 'frozen', False)
        target_path = sys.executable if is_frozen else os.path.abspath(__file__)
        target_dir = os.path.dirname(target_path)
        temp_exe = os.path.join(target_dir, "update_temp.exe")

        # 2. Téléchargement du nouvel exécutable
        req = urllib.request.Request(download_url, headers={"User-Agent": "smartPresence-Updater"})
        with urllib.request.urlopen(req, timeout=60) as resp, open(temp_exe, 'wb') as out_file:
            out_file.write(resp.read())

        # 3. Création du script batch relais pour Windows
        if os.name == 'nt':
            bat_path = os.path.join(target_dir, "run_update.bat")
            bat_script = f"""@echo off
chcp 65001 > nul
echo Mise a jour de Club Robotique en cours...
timeout /t 2 /nobreak > nul

:RETRY
copy /y "{temp_exe}" "{target_path}" > nul
if %errorlevel% neq 0 (
    timeout /t 1 /nobreak > nul
    goto RETRY
)

del "{temp_exe}" > nul
echo Lancement de la nouvelle version...
start "" "{target_path}"
del "%~f0"
"""
            with open(bat_path, "w", encoding="utf-8") as f:
                f.write(bat_script)

            # Lancement du batch en processus détaché
            subprocess.Popen(["cmd.exe", "/c", bat_path], creationflags=subprocess.DETACHED_PROCESS)
            
            # Fermeture propre de l'application actuelle
            threading_timer = subprocess.Popen
            time.sleep(0.5)
            os._exit(0)
            return True, "Mise à jour lancée."

        else:
            return False, "Système non-Windows : mise à jour manuelle requise."

    except Exception as e:
        return False, str(e)