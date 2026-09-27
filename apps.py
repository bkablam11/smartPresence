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

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Réduit les logs verbeux
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
