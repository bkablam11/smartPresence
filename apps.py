#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Lanceur autonome hors-ligne pour l'application Club Robotique - Lycée Moderne 1 d'Abobo.
Fonctionne sur n'importe quel PC Windows / Mac / Linux avec Python 3 sans aucune installation requise.
"""

import http.server
import socketserver
import webbrowser
import threading
import os
import sys
import updater  # Importe notre module d'auto-update

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Désactive le cache navigateur
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    # Intercepte les requêtes de mise à jour venant de l'interface JS
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
                # Lance la mise à jour
                updater.apply_update(info["download_url"])
            else:
                self.send_response(400)
                self.end_headers()
            return

        # Fichiers HTML/CSS/JS normaux
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

    # Démarre le serveur local dans un thread en arrière-plan
    server_thread = threading.Thread(target=start_server, daemon=True)
    server_thread.start()

    # Ouvre automatiquement le navigateur par défaut
    url = f"http://localhost:{PORT}/index.html"
    print(f"\n-> Ouverture automatique dans votre navigateur : {url}")
    print("-> L'application fonctionne à 100% hors-ligne (aucune connexion requise).")
    print("-> Pour quitter, fermez simplement cette fenêtre.\n")
    webbrowser.open(url)

    try:
        # Garde le script actif
        server_thread.join()
    except KeyboardInterrupt:
        print("\nArrêt de l'application. À bientôt !")
        sys.exit(0)
