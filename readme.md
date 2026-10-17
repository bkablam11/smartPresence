# 🤖 Club Robotique — Lycée Moderne 1 d'Abobo

<p align="center">
  <img src="assets/images/logo_club.jpeg" alt="Logo Club Robotique" width="70" style="border-radius: 50%; vertical-align: middle; margin-right: 15px;" />
  <img src="assets/images/logo_lycee.png" alt="Logo Lycée Moderne 1 Abobo" width="90" style="vertical-align: middle; margin-left: 15px;" />
</p>

<p align="center">
  <strong>Application de Gestion Quotidienne des Présences & Registre d'Émargement Officiel</strong><br>
  <em>DRENA : ABIDJAN 4 • RÉPUBLIQUE DE CÔTE D'IVOIRE • ANNÉE SCOLAIRE 2025-2026</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Lyc%C3%A9e%20Moderne%201%20d'Abobo-DRENA%20Abidjan%204-008751?style=for-the-badge&logo=target&logoColor=white" alt="Lycée Moderne 1 d'Abobo" />
  <img src="https://img.shields.io/badge/Version-2.1.0-0284c7?style=for-the-badge&logo=git&logoColor=white" alt="Version 2.1" />
  <img src="https://img.shields.io/badge/Mode-100%25%20Hors--Ligne-059669?style=for-the-badge&logo=pwa&logoColor=white" alt="100% Hors-Ligne" />
  <img src="https://img.shields.io/badge/Base%20de%20Donn%C3%A9es-Google%20Sheets-34a853?style=for-the-badge&logo=googlesheets&logoColor=white" alt="Google Sheets smartPresence" />
  <img src="https://img.shields.io/badge/Compatibilit%C3%A9-Windows%2010%20%2F%2011%20%2F%20macOS-0078d4?style=for-the-badge&logo=windows&logoColor=white" alt="Windows Compatible" />
  <img src="https://img.shields.io/badge/Ex%C3%A9cutable-PyInstaller%20.EXE-ffde57?style=for-the-badge&logo=python&logoColor=black" alt="PyInstaller" />
</p>

---

## 🔗 Liens Officiels & Espaces de Travail du Projet

| Ressource | Type | Lien d'accès direct |
| :--- | :--- | :--- |
| 📊 **Base de Données Centrale** | Google Sheets (`smartPresence`) | [Ouvrir le classeur smartPresence](https://docs.google.com/spreadsheets/d/1U7dd1hOCg4m_l6Yrpj9MYOtFOZ-CM4rguHePBHnw77Q/edit) |
| ⚡ **Backend Web Service** | Google Apps Script (`Code.gs`) | [Éditeur Apps Script smartPresence](https://script.google.com/u/0/home/projects/1DSooISQua-YOfW3mlf1p6jwd3CJ8TXOTBeAq8FpMvgxC0D-3_JVQ2aOL/edit) |
| 💻 **Serveur Local (Port par défaut)** | Client Web Navigateur | `http://localhost:8080` ou `http://localhost:8080/index.html` |
| 🌐 **Serveur Réseau Local (Wi-Fi Lycée)** | Accès multi-appareils | `http://192.168.43.79:8000` *(selon votre adresse IP machine)* |

---

## 📋 Présentation du Projet

Cette application a été conçue sur mesure pour les besoins du **Club Scientifique et Robotique du Lycée Moderne 1 d'Abobo** (DRENA Abidjan 4).

Elle permet à l'encadreur ou au responsable d'atelier :
1. **D'effectuer l'appel de chaque séance en quelques secondes** via une interface moderne, fluide et réactive.
2. **De pointer les élèves au choix :** manuellement en 1 clic ou par **scan de QR Code / Code-barres** via la caméra.
3. **De suivre l'assiduité en temps réel** (inscrits, présents, absents, taux de présence en pourcentages).
4. **De filtrer instantanément** la promotion par **Genre (Filles / Garçons)** et par **Âge dynamique** (11 à 15 ans).
5. **D'exporter instantanément des fiches de présence officielles en PDF A4 paysage** conformes aux exigences administratives (double logo institutionnel, tableau d'émargement et cadre de signature de l'encadreur).
6. **De synchroniser de manière bidirectionnelle** toutes les données avec le classeur **Google Sheets (`smartPresence`)** dès qu'Internet est disponible.

> ⚡ **Architecture 100% Offline-First :** L'application fonctionne sans aucune connexion Internet dans les salles de classe du lycée. Toutes les opérations sont conservées localement dans le `localStorage` et synchronisées en un clic dès le retour du réseau.

---

## 🛠️ Dernières Modifications Appliquées

### 1. Saisie Libre du Champ Classe (Remplacement de la liste déroulante)
Pour permettre d'accueillir n'importe quelle classe (`6e 6`, `3e 2`, `2nde C`, `Tle D`, etc.) sans être limité par une liste rigide :

> ⚠️ **ATTENTION À L'ID DU CHAMP DANS `index.html` !**<br>
> Dans `app.js`, la fonction d'ajout lit : `document.getElementById('newClasse').value`.<br>
> L'identifiant dans `index.html` doit donc obligatoirement être **`id="newClasse"`** (et non `id="classe"`) pour éviter une erreur JavaScript `null value`.

Le champ classe est libre à l'ajout comme à la modification d'un élève.

#### Modification dans `index.html` (vers la ligne 163) :
```html
<div class="form-group">
    <label for="newClasse">CLASSE *</label>
    <input
        type="text"
        id="newClasse"
        name="newClasse"
        placeholder="Ex: 6e 6, 5e 7, 3e 2, Tle D..."
        required
    >
</div>
```

---

## 🚀 Nouvelle Amélioration : Pointage par Scan QR Code / Code-barres Webcam

Cette amélioration permet de scanner le badge d'un élève avec la webcam du PC : dès lecture du matricule, l'élève est **marqué « Présent » automatiquement**, un **bip sonore de succès** retentit et les compteurs se mettent à jour instantanément.

La fonctionnalité est intégrée dans `index.html`, `style.css` et `app.js` : utilisez **📷 Scanner un badge** dans la barre d'appel. Autorisez l'accès à la webcam lorsque le navigateur le demande. L'accès caméra nécessite un contexte sécurisé : lancez l'application avec `python apps.py` et ouvrez `http://localhost:8080` (ou utilisez HTTPS).

Les bibliothèques du scanner, des QR codes et des PDF sont fournies dans `assets/js/` pour permettre leur utilisation sans connexion Internet. Un scan pointe uniquement l'élève correspondant à la séance sélectionnée, enregistre le pointage localement et joue un bip. Les matricules partagés ne peuvent pas servir seuls à identifier un élève : dans ce cas, son badge QR personnel est nécessaire.

### Générer les badges QR individuels

1. Cliquez sur **Générer les badges QR** dans le panneau de gauche.
2. Enregistrez le PDF téléchargé, puis imprimez-le en format A4 à **100 %** (sans ajustement à la page).
3. Chaque badge contient le nom, la classe, le matricule et un QR code distinct. Découpez les badges et distribuez-les aux élèves.

Le QR code contient un identifiant interne unique préfixé `smartpresence:` ; il n'inclut ni coordonnées ni données de contact. Le PDF est établi à partir de la liste d'élèves actuellement chargée. Après toute modification du registre, régénérez les badges.

### Bilan et prochaines étapes

**Réalisé**

- Saisie libre de la classe à l'ajout et à la modification d'un élève.
- Pointage par webcam avec lecture de QR codes et de codes-barres, retour sonore, mise à jour immédiate des présences et enregistrement local.
- Identifiants uniques pour distinguer les élèves partageant un matricule, conservés dans les onglets Google Sheets `Élèves` et `Détail_Appels`.
- Génération hors-ligne des badges PDF à partir de la liste chargée. Le fichier [badges_qr_eleves.pdf](./badges_qr_eleves.pdf) contient les 58 badges du registre utilisé lors de sa génération (10 pages A4).
- Bibliothèques QR et PDF locales dans `assets/js/`, avec leurs licences, pour l'utilisation sans CDN.

**À faire pour la mise en service**

1. Copier la nouvelle version de `Code.gs` dans Google Apps Script et la déployer en **nouvelle version** afin que les identifiants uniques soient conservés dans Sheets.
2. Tester le scan avec la webcam et les autorisations du navigateur sur l'ordinateur qui servira au pointage. La caméra doit être utilisée depuis `localhost` ou une adresse HTTPS.
3. Imprimer une page test à 100 %, vérifier la lecture de plusieurs badges, puis imprimer le reste. Régénérer le PDF après chaque mise à jour du registre pour que les badges restent synchronisés.

**Améliorations possibles ensuite**

- Ajouter une date de création et une procédure de révocation/réimpression des badges perdus.
- Permettre de filtrer les badges par classe avant de générer le PDF.
- Ajouter un indicateur visuel de doublon et un historique des scans pour faciliter le contrôle des pointages.

---

## 🔄 Comment Appliquer et Voir Immédiatement Vos Modifications

Pour voir vos modifications instantanément à l'écran sans que le navigateur ne serve d'anciennes versions en mémoire cache :

1. **Enregistrez tous les fichiers modifiés dans VS Code :**
   Faites `Fichier` > `Enregistrer tout` (ou `Ctrl+K S` sur Windows / `Cmd+Option+S` sur Mac).
2. **Rechargez la page sans le cache :**
   - Sur Windows : pressez simultanément **`Ctrl + F5`** (ou `Ctrl + Shift + R`).
   - Sur macOS : pressez **`Cmd + Shift + R`**.
3. **Si vous avez modifié `apps.py` :**
   - Retournez dans le terminal VS Code.
   - Arrêtez le serveur avec **`Ctrl + C`**.
   - Relancez avec :
     ```bash
     python apps.py
     ```
4. **Si vous avez modifié `Code.gs` :**
   Copiez le fichier dans Google Apps Script, enregistrez, puis déployez une nouvelle version du script pour conserver l'identifiant unique dans les onglets Élèves et Détail_Appels.

---

## 🗄️ Structure des Onglets Google Sheets (`smartPresence`)

Le classeur officiel est structuré selon 3 onglets synchronisés en temps réel :

1. **`Élèves` (Registre officiel)** :
   - Colonnes : `N°` | `Matricule` | `Nom` | `Prénom` | `Sexe` | `Âge` | `Classe` | `Contact Parents` | `Statut` | `ID Élève` (identifiant technique unique)
2. **`Présences` (Historique des séances)** :
   - Date, Inscrits, Présents, Absents, Taux de présence en %.
3. **`Détail_Appels` (Traçabilité complète)** :
   - Date & Heure du pointage, Matricule, Nom, Prénom, Statut (Présent / Absent), ID Élève unique.

---

## 💻 Compilation de la Version Finale en `.exe` (PyInstaller)

Pour distribuer la dernière version à tous les ordinateurs Windows du lycée sans installation requise :

```cmd
pyinstaller --onefile --noconsole --name "ClubRobotique_Abobo" --add-data "index.html;." --add-data "style.css;." --add-data "app.js;." --add-data "assets;assets" apps.py
```

L'exécutable autonome est produit directement dans le dossier **`dist/ClubRobotique_Abobo.exe`**.

---

<p align="center">
  <strong>Conçu avec passion pour l'excellence scientifique et la robotique au Lycée Moderne 1 d'Abobo.</strong><br>
  🇨🇮 <em>République de Côte d'Ivoire — Union • Discipline • Travail</em>
</p>
