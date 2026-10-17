#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lanceur autonome hors-ligne pour l'application Club Robotique - Lycée Moderne 1 d'Abobo.
"""

import http.server
import socketserver
import webbrowser
import threading
import os
import sys
import json       # 👈 INDISPENSABLE pour json.dumps()
import updater

PORT = 8080

# Détection du dossier selon que l'on tourne en script pur ou en exécutable PyInstaller
if getattr(sys, 'frozen', False):
    DIRECTORY = sys._MEIPASS  # 👈 Dossier temporaire PyInstaller
else:
    DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path == '/api/check-update':
            info = updater.get_latest_release_info()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(info).encode('utf-8'))
            return

        elif self.path.startswith('/api/apply-update'):
            info = updater.get_latest_release_info()
            if info.get("update_available") and info.get("download_url"):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "starting"}).encode('utf-8'))
                updater.apply_update(info["download_url"])
            else:
                self.send_response(400)
                self.end_headers()
            return

        return super().do_GET()

    def log_message(self, format, *args):
        pass

def start_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"[OK] Serveur local démarré sur http://localhost:{PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    print("=" * 65)
    print("  CLUB ROBOTIQUE — LYCÉE MODERNE 1 D'ABOBO (DRENA ABIDJAN 4)")
    print("  Lancement de l'application hors-ligne...")
    print("=" * 65)

    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    url = f"http://localhost:{PORT}/index.html"
    print(f"\n-> Ouverture automatique dans votre navigateur : {url}")
    print("-> L'application fonctionne à 100% hors-ligne (aucune connexion requise).")
    print("-> Pour quitter, fermez simplement cette fenêtre.\n")
    webbrowser.open(url)

    try:
        server_thread.join()
    except KeyboardInterrupt:
        print("\nArrêt de l'application. À bientôt !")
        sys.exit(0)
