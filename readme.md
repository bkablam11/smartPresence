# 🤖 Club Robotique — Lycée Moderne 1 d'Abobo
> **Application de Gestion Quotidienne des Présences & Registre d'Émargement**  
> **DRENA : ABIDJAN 4 • RÉPUBLIQUE DE CÔTE D'IVOIRE**

---

## 📋 Présentation du Projet

Cette application a été conçue sur mesure pour les besoins du **Club Scientifique et Robotique du Lycée Moderne 1 d'Abobo**.  
Elle permet à l'encadreur ou au responsable du club d'effectuer l'appel de chaque séance, de suivre l'assiduité des élèves en temps réel, d'exporter instantanément des fiches de présence officielles en PDF avec signatures et logos institutionnels, et de synchroniser toutes les données de manière bidirectionnelle avec **Google Sheets** sans aucune manipulation manuelle complexe.

L'application est **100% Hors-Ligne (Offline-First)** : elle s'exécute sur n'importe quel ordinateur Windows, même sans aucune connexion Internet au lycée. Dès qu'une connexion réseau est détectée, un simple clic permet d'envoyer les présences vers le classeur Google Sheets officiel.

---

## ✨ Ce qui a été Réalisé & Fonctionnalités Clés

### 1. 🗄️ Base de Données Directe Google Sheets (smartPresence)
- **Architecture sans intermédiaire payant** : Le classeur Google Sheets `smartPresence` sert de base de données centrale.
- **Google Apps Script (`Code.gs`) intégré** : Un Web Service sécurisé traite les requêtes `GET` (chargement des élèves et historiques) et `POST` (enregistrement des fiches d'appel).
- **Liaison automatique dans le code** : L'URL du script est codée directement dans le système (`app.js`). Aucune saisie d'URL n'est demandée à l'utilisateur dans l'interface.
- **Synchronisation bidirectionnelle** :
  - `Élèves` : enregistre la fiche signalétique des élèves (Matricule, Nom, Prénoms, Sexe, Âge, Classe, Contact Parent, Statut).
  - `Présences` : synthèse et statistiques par séance.
  - `Détail_Appels` : ligne par ligne avec horodatage pour un audit exhaustif.

### 2. 👥 Base Initiale Complète des 44 Élèves
- Les 44 membres officiels du Club Robotique ont été intégrés avec leurs matricules officiels, leurs classes (de la 6ème à la 4ème : `6e 6`, `5e 7`, `5e 6`, `5e 5`, `5e 4`, `4e 7`, `4e 6`, `4e 4`, `4e 3`, `4e 2`), âges et numéros de téléphone des parents.
- Système de recherche instantanée par nom ou matricule.
- Filtrage rapide par classe.

### 3. ⚡ Appel Quotidien Rapide & Intuitif
- Bouton **« Tout cocher présent »** pour valider toute la promotion en un clic, puis décocher uniquement les absents.
- Bouton **« Tout décocher »** pour réinitialiser la séance.
- Compteurs dynamiques en temps réel :
  - **Inscrits** (Total des élèves actifs)
  - **Présents** (Nombre d'élèves ayant émargé)
  - **Absents** (Nombre d'élèves manquants)
  - **Taux de présence (%)** avec jauge visuelle instantanée.

### 4. 📄 Génération Immédiate de la Fiche de Présence Officielle (PDF A4)
- Conçue pour l'administration du Lycée Moderne 1 d'Abobo et la DRENA Abidjan 4.
- **Double logo officiel intégré** :
  - Logo du Club Scientifique & Robotique à gauche.
  - Logo officiel du Lycée Moderne 1 d'Abobo à droite.
- En-tête officiel : *République de Côte d'Ivoire, Ministère de l'Éducation Nationale et de l'Alphabétisation, DRENA Abidjan 4*.
- Tableau d'émargement complet avec statut (PRÉSENT / ABSENT).
- Cadre réservé pour la **Signature et Visa de l'Encadreur / Responsable du Club**.
- **Bibliothèques PDF embarquées localement** (`assets/js/`) pour générer les PDF même sans Internet.

### 5. 🔌 Mode Hors-Ligne Total (Offline-First)
- Toutes les données sont sauvegardées en continu dans le stockage local de l'ordinateur (`localStorage`).
- Indicateur visuel d'état réseau en haut à droite (**En ligne** / **Hors-ligne**).
- Bandeau d'alerte dès la détection d'Internet pour envoyer les données en attente vers Google Sheets.

---

## 💻 Comment Déployer & Utiliser sur n'importe quel Ordinateur Windows

Vous pouvez installer et faire tourner l'application sur tous les ordinateurs du lycée via 3 méthodes différentes :

### 🟢 Méthode 1 : Le Lancement en 1 Clic (Recommandé sur Windows)
Dans le dossier du projet, un fichier exécutable batch a été créé :
1. Copiez le dossier du projet sur une clé USB ou directement sur le bureau du PC Windows.
2. Double-cliquez simplement sur :
   ```text
   LANCER_APPLICATION.bat
   ```
3. L'application démarre immédiatement et s'ouvre dans votre navigateur web par défaut (Google Chrome, Microsoft Edge, etc.).

---

### 🟡 Méthode 2 : Lancement Portable avec Python
Si Python est installé sur la machine Windows :
1. Ouvrez l'invite de commande (CMD) dans le dossier du projet.
2. Exécutez la commande :
   ```bash
   python launcher.py
   ```
3. Le script démarre un serveur local autonome et ouvre la page sur `http://localhost:8080`.

#### Optionnel : Transformer en vrai fichier `.exe` Windows autonome
Pour créer un fichier `.exe` que l'on peut installer sans avoir besoin d'ouvrir de console :
```bash
pip install pyinstaller
pyinstaller --onefile --noconsole --name "ClubRobotique_Abobo" apps.py
```
Le fichier `ClubRobotique_Abobo.exe` généré dans le sous-dossier `dist` peut être placé sur n'importe quel PC Windows !

---

### 🔵 Méthode 3 : Installer comme Application de Bureau (PWA via Chrome ou Edge)
Google Chrome et Microsoft Edge permettent de transformer ce site en véritable application Windows avec icône sur le bureau et dans le menu Démarrer :
1. Lancez l'application une première fois dans **Chrome** ou **Edge**.
2. Dans la barre d'adresse tout à droite, cliquez sur la petite icône **« Installer l'application »** (ou menu `...` > **Applications** > **Installer ce site en tant qu'application**).
3. Une icône **Club Robotique** apparaît sur votre Bureau Windows.
4. L'application s'ouvre désormais dans sa propre fenêtre indépendante, sans barre de navigation, exactement comme un logiciel Windows natif (Word, Excel, etc.), et fonctionne à 100% sans Internet !

---

## 🚀 Pistes d'Améliorations Futures (Roadmap)

Voici les fonctionnalités prêtes à être déployées lors des prochaines versions :

### 1. 📲 Notification WhatsApp / SMS Directe aux Parents
- Bouton vert WhatsApp sur la ligne de chaque élève absent.
- Message pré-rempli en un clic :
  > *"Bonjour cher parent, nous vous informons que votre enfant [Nom Prénom] de la classe [Classe] n'a pas répondu présent à la séance du Club Robotique de ce [Date] au Lycée Moderne 1 d'Abobo. Merci de bien vouloir nous contacter en cas d'empêchement justifié."*

### 2. 🪪 Cartes de Membre avec QR Code & Émargement par Caméra
- Génération automatique de badges/cartes de membres pour les 44 élèves.
- Scan du QR Code via la webcam du PC portable ou la caméra du téléphone pour pointer l'élève en moins d'une seconde.

### 3. 📊 Tableau de Bord d'Assiduité & Alertes d'Absences Répétées
- Identification automatique des élèves ayant plus de 2 ou 3 absences consécutives.
- Graphiques d'évolution des présences par niveau (`6e`, `5e`, `4e`).
- Synthèse trimestrielle prête à être remise à la Direction du Lycée ou à la DRENA Abidjan 4.

### 4. 🔄 Synchronisation Automatique Périodique en Arrière-plan
- Envoi automatique des données dès qu'un réseau Wi-Fi ou partage de connexion 4G est connecté, sans action manuelle.

---

## 📁 Structure des Fichiers du Projet

```text
├── index.html                 # Interface utilisateur principale
├── style.css                  # Design moderne aux couleurs institutionnelles
├── app.js                     # Logique d'émargement, calculs et communication Sheets
├── Code.gs                    # Script Google Apps Script déployé sur Google Drive
├── launcher.py                # Lanceur local portable Python
├── LANCER_APPLICATION.bat     # Fichier batch Windows de démarrage en 1 clic
├── assets/
│   ├── images/
│   │   ├── logo_club.jpeg     # Logo du Club Scientifique & Robotique
│   │   └── logo_lycee.png     # Logo officiel du Lycée Moderne 1 d'Abobo
│   └── js/
│       ├── jspdf.umd.min.js             # Moteur de génération PDF hors-ligne
│       └── jspdf.plugin.autotable.min.js# Plugin de tableaux PDF hors-ligne
└── README.md                  # Documentation complète du projet
```

---

## ⚙️ Configuration & Maintenance du Google Apps Script (`Code.gs`)

Pour mettre à jour ou inspecter le script lié à votre classeur Google Sheets **smartPresence** :
1. Rendez-vous sur votre Google Drive et ouvrez le classeur **`smartPresence`**.
2. Cliquez sur le menu supérieur : **Extensions** > **Apps Script**.
3. Le code présent correspond exactement au fichier **`Code.gs`** de ce projet.
4. Pour déployer toute modification :
   - Cliquez sur **Déployer** > **Gérer les déploiements**.
   - Cliquez sur l'icône **Crayon (Modifier)**.
   - Sélectionnez Version : **« Nouvelle version »**.
   - Cliquez sur **Déployer**. L'URL `/exec` reste identique et l'application continue de fonctionner sans interruption.

---

**Développé pour l'excellence et la promotion des sciences technologiques au Lycée Moderne 1 d'Abobo.** 🚀
