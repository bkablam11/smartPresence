# 🤖 Club Robotique — Lycée Moderne 1 d'Abobo

<p align="center">
  <img src="assets/images/logo_club.jpeg" alt="Logo Club Robotique" width="90" style="border-radius: 50%; vertical-align: middle; margin-right: 15px;" />
  <img src="assets/images/logo_lycee.png" alt="Logo Lycée Moderne 1 Abobo" width="90" style="vertical-align: middle; margin-left: 15px;" />
</p>

<p align="center">
  <strong>Application de Gestion Quotidienne des Présences & Registre d'Émargement Officiel</strong><br>
  <em>DRENA : ABIDJAN 4 • RÉPUBLIQUE DE CÔTE D'IVOIRE • ANNÉE SCOLAIRE 2025-2026</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lyc%C3%A9e%20Moderne%201%20d'Abobo-DRENA%20Abidjan%204-008751?style=for-the-badge&logo=target&logoColor=white" alt="Lycée Moderne 1 d'Abobo" />
  <img src="https://img.shields.io/badge/Version-2.0.0-0284c7?style=for-the-badge&logo=git&logoColor=white" alt="Version 2.0" />
  <img src="https://img.shields.io/badge/Mode-100%25%20Hors--Ligne-059669?style=for-the-badge&logo=pwa&logoColor=white" alt="100% Hors-Ligne" />
  <img src="https://img.shields.io/badge/Base%20de%20Donn%C3%A9es-Google%20Sheets-34a853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets smartPresence" />
  <img src="https://img.shields.io/badge/Compatibilit%C3%A9-Windows%2010%20%2F%2011%20%2F%20macOS-0078d4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Compatible" />
  <img src="https://img.shields.io/badge/Ex%C3%A9cutable-PyInstaller%20.EXE-ffde57?style=for-the-badge&logo=python&logoColor=black" alt="PyInstaller" />
</p>

---

## 📋 Présentation du Projet

Cette application a été conçue sur mesure pour les besoins du **Club Scientifique et Robotique du Lycée Moderne 1 d'Abobo** (DRENA Abidjan 4).

Elle permet à l'encadreur ou au responsable d'atelier :
1. **D'effectuer l'appel de chaque séance en quelques secondes** via une interface moderne, fluide et réactive.
2. **De suivre l'assiduité en temps réel** (inscrits, présents, absents, taux de présence en pourcentages).
3. **De filtrer instantanément** la promotion par **Genre (Filles / Garçons)** et par **Âge dynamique** (11 ans, 12 ans, 13 ans, 14 ans...).
4. **D'exporter instantanément des fiches de présence officielles en PDF A4** conformes aux exigences administratives (double logo institutionnel, tableau d'émargement et cadre de signature de l'encadreur).
5. **De synchroniser de manière bidirectionnelle** toutes les données avec le classeur **Google Sheets (`smartPresence`)** dès qu'Internet est disponible.

> ⚡ **Architecture 100% Offline-First :** L'application fonctionne sans aucune connexion Internet dans les salles de classe du lycée. Toutes les opérations sont conservées localement et synchronisées en un clic dès le retour du réseau.

---

## ✨ Fonctionnalités Réalisées & Atouts Techniques

### 1. 🗄️ Base de Données Directe Google Sheets (`smartPresence`)
- **Connexion transparente sans intermédiaire payant** : Le classeur Google Sheets officiel `smartPresence` sert de base centrale pérenne.
- **Script Google Apps Script (`Code.gs`) intégré** : Traite les requêtes sécurisées `GET` (chargement initial et réactualisation) et `POST` (sauvegarde des listes d'élèves et des émargements).
- **Liaison automatique dans le code** : L'URL du script web est directement intégrée dans `app.js` sans demander aucune saisie manuelle d'URL aux encadreurs.
- **Gestion stricte des numéros de téléphone ivoiriens (10 chiffres)** : La colonne des contacts est automatiquement verrouillée en format *Texte Brut* (`@`) pour empêcher Google Sheets de supprimer le `0` initial (`07...`, `05...`, `01...`).
- **Structure des 3 onglets Google Sheets** :
  - `Élèves` : registre complet (Matricule, Nom, Prénom, Sexe, Âge, Classe, Contact Parents, Statut).
  - `Présences` : historique séance par séance avec décompte des présents/absents et taux.
  - `Détail_Appels` : traçabilité élève par élève avec horodatage exact pour audit.

### 2. 👥 Base Intégrée des 45 Élèves Officiels & Âges Dynamiques
- Les **45 membres officiels du Club Robotique** sont pré-chargés avec leurs matricules, classes (de la 6ème à la 4ème : `6e 6`, `5e 7`, `5e 6`, `5e 5`, `5e 4`, `4e 7`, `4e 6`, `4e 4`, `4e 3`, `4e 2`), sexes et contacts parents.
- **Calcul automatique de l'âge** : Les âges sont calculés en temps réel en fonction de l'année de naissance et de l'année en cours (mise à jour automatique au 1er janvier sans recalcul manuel).
- **Ajout, modification et suppression d'élèves** intégrés avec prévisualisation immédiate de l'âge.

### 3. 🎯 Nouveau Système de Filtres & Ergonomie en Deux Lignes
Pour une lisibilité optimale sur les écrans d'ordinateurs et ordinateurs portables de classe :
- **Ligne 1 (Recherche & Appel rapide)** :
  - Barre de recherche en temps réel par Nom, Prénom ou Matricule avec bouton rapide d'effacement (✕).
  - Boutons d'appel rapide : **`✓ Tout cocher`** (pointe les élèves filtrés en 1 clic) et **`✕ Tout décocher`**.
- **Ligne 2 (Filtres ciblés & Statut)** :
  - **Filtre par Genre** : `👥 Tous les genres`, `👧 Filles (F)`, `👦 Garçons (M)`.
  - **Filtre par Âge dynamique** : `🎂 Tous les âges` avec décompte exact d'élèves par âge (ex : *12 ans (16)*, *13 ans (17)*, *14 ans (10)*...).
  - Bouton **`↺ Réinitialiser`** (apparaît instantanément dès qu'un filtre est actif).
  - Indicateur de décompte en direct (*« 16 élèves affichés sur 45 »*).

### 4. 📄 Génération PDF Officielle Conforme DRENA Abidjan 4 (Format A4)
- **Double logo officiel intégré** :
  - Logo du Club Scientifique & Robotique à gauche.
  - Logo officiel du Lycée Moderne 1 d'Abobo à droite.
- En-tête ministériel officiel : *République de Côte d'Ivoire • Ministère de l'Éducation Nationale et de l'Alphabétisation • DRENA : ABIDJAN 4*.
- Tableau d'émargement propre avec matricules, noms, âges, contacts et mention **PRÉSENT**.
- Emplacement réservé pour **le visa, la signature et le cachet de l'encadreur**.
- **Bibliothèques PDF embarquées localement** (`assets/js/jspdf.umd.min.js`) : fonctionne à 100% hors-ligne sans connexion CDN externe.

### 5. 🔌 Mode Hors-Ligne Total (Offline-First)
- Sauvegarde continue dans le `localStorage` du navigateur : aucune perte de données en cas de coupure de courant ou de fermeture accidentelle.
- Badge d'état réseau en temps réel (**En ligne** / **Hors-ligne**).
- Bandeau de reconnexion automatique invitant à synchroniser vers Google Sheets dès qu'Internet revient.
- Boutons d'export/sauvegarde de secours en fichier JSON.

---

## 💻 Guide d'Installation & Déploiement sur Windows

Vous avez **4 méthodes simples** pour installer et exécuter l'application sur n'importe quel ordinateur Windows du lycée :

---

### 🟢 Méthode 1 : Lancement en 1 Clic (Recommandé — Sans rien installer)

C'est la méthode la plus rapide pour les encadreurs :
1. Copiez l'intégralité du dossier du projet sur une **clé USB** ou sur le **Bureau** du PC Windows.
2. Double-cliquez simplement sur l'un des fichiers batch :
   ```text
   LANCER_APPLICATION.bat
   ```
   *(ou `launch.bat`)*
3. Le script détecte votre environnement, démarre le service local et ouvre automatiquement votre navigateur par défaut (Google Chrome ou Microsoft Edge).

---

### 🟡 Méthode 2 : Compiler un Exécutable Windows `.exe` Autonome (PyInstaller)

Pour transformer l'application en un véritable logiciel Windows `.exe` sans invite de commande :

#### 1. Prérequis sur Windows
Assurez-vous que Python est installé sur votre ordinateur Windows (cochez bien l'option *"Add Python to PATH"* lors de l'installation).

#### 2. Ouvrir le terminal dans le dossier du projet
Dans l'Explorateur Windows, faites un clic droit dans le dossier du projet > **« Ouvrir dans le Terminal »** (ou tapez `cmd` dans la barre d'adresse du dossier).

#### 3. Installer PyInstaller
```cmd
pip install pyinstaller
```
*(ou si vous utilisez uv : `uv pip install pyinstaller`)*

#### 4. Compiler le fichier `.exe`
> ⚠️ **IMPORTANT SUR WINDOWS :**  
> Contrairement à macOS/Linux qui utilise deux-points (`:`), **Windows exige un point-virgule (`;`)** pour séparer les fichiers dans l'option `--add-data`.

Exécutez la commande suivante sur une seule ligne :
```cmd
pyinstaller --onefile --noconsole --name "ClubRobotique_Abobo" --add-data "index.html;." --add-data "style.css;." --add-data "app.js;." --add-data "assets;assets" apps.py
```

#### 5. Résultat
- Votre exécutable autonome **`ClubRobotique_Abobo.exe`** est généré dans le sous-dossier **`dist/`**.
- Copiez ce fichier `.exe` sur n'importe quelle clé USB : il se lance d'un simple double-clic sur n'importe quel PC Windows, sans nécessiter Python ni connexion Internet !

---

### 🔵 Méthode 3 : Installer comme Application de Bureau Native (PWA Chrome / Edge)

Google Chrome et Microsoft Edge permettent de transformer l'interface en une vraie application Windows avec raccourci sur le Bureau et dans le menu Démarrer :
1. Lancez l'application dans **Google Chrome** ou **Microsoft Edge**.
2. Dans la barre d'adresse à droite, cliquez sur l'icône **« Installer l'application »** (ou via le menu `⋮` > **Applications** > **Installer ce site en tant qu'application**).
3. Une icône officielle **Club Robotique** est créée sur votre Bureau Windows.
4. L'application s'ouvre désormais dans sa propre fenêtre indépendante, sans barre de navigation, comme un logiciel bureautique natif (Word, Excel), et fonctionne à 100% hors-ligne.

---

### 🟣 Méthode 4 : Lancement Manuel avec Python

Si vous préférez exécuter le serveur local en ligne de commande :
```bash
python apps.py
```
*(ou `python launcher.py`)*

Le script démarre automatiquement un serveur HTTP local sur le port `8080` et ouvre votre navigateur sur `http://localhost:8080`.

---

## 📁 Arborescence des Fichiers du Projet

```text
smartPresence/
├── index.html                 # Interface web épurée avec filtres Genre/Âge et appel rapide
├── style.css                  # Feuilles de styles modernes, responsive et contrastées
├── app.js                     # Logique métier : 45 élèves, filtres, âges dynamiques & Sheets
├── Code.gs                    # Web Service Google Apps Script pour Google Sheets
├── apps.py                    # Serveur Python autonome avec support _MEIPASS (PyInstaller)
├── launcher.py                # Lanceur portable alternatif
├── LANCER_APPLICATION.bat     # Lanceur Windows 1-clic principal
├── launch.bat                 # Lanceur Windows 1-clic secondaire
├── assets/
│   ├── images/
│   │   ├── logo_club.jpeg     # Logo officiel du Club Scientifique & Robotique
│   │   └── logo_lycee.png     # Logo officiel du Lycée Moderne 1 d'Abobo
│   └── js/
│       ├── jspdf.umd.min.js             # Moteur PDF embarqué hors-ligne
│       ├── jspdf.umd.min.js.map         # Sourcemap pour développement propre
│       └── jspdf.plugin.autotable.min.js# Module de tableau d'émargement PDF
└── README.md                  # Documentation officielle du projet
```

---

## ⚙️ Configuration & Maintenance du Google Apps Script (`Code.gs`)

Pour mettre à jour ou inspecter le script lié à votre classeur Google Sheets **smartPresence** :
1. Ouvrez votre classeur Google Sheets **`smartPresence`** sur Google Drive.
2. Cliquez sur le menu supérieur : **Extensions** > **Apps Script**.
3. Remplacez le code existant par le contenu complet du fichier **`Code.gs`** du projet.
4. Cliquez sur **Enregistrer** (icône disquette).
5. Cliquez sur **Déployer** > **Gérer les déploiements** :
   - Cliquez sur l'icône **Crayon (Modifier)**.
   - Version : sélectionnez **« Nouvelle version »**.
   - Cliquez sur **Déployer**.  
   *(L'URL de synchronisation `/exec` reste strictement identique et l'application continue de fonctionner sans interruption).*

---

## 🚀 Pistes d'Améliorations Futures (Roadmap)

1. **📲 Notification WhatsApp / SMS Directe aux Parents** : Bouton sur la ligne d'un absent pour ouvrir un message WhatsApp pré-rempli adressé au contact parent.
2. **🪪 Badges avec QR Code & Scan Webcam** : Pointage instantané de l'élève à l'entrée de la salle en scannant sa carte de membre.
3. **📊 Tableau de Bord d'Assiduité Annuel** : Statistiques trimestrielles des absences répétées pour transmission à la Direction du Lycée et à la DRENA Abidjan 4.
4. **🔄 Synchronisation Silencieuse en Tâche de Fond** : Mise à jour automatique de Google Sheets dès détection d'une connexion Wi-Fi ou partage 4G.

---

<p align="center">
  <strong>Conçu avec passion pour l'excellence scientifique et la robotique au Lycée Moderne 1 d'Abobo.</strong><br>
  🇨🇮 <em>République de Côte d'Ivoire — Union • Discipline • Travail</em>
</p>
