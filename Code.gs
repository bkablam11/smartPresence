/**
 * CLUB ROBOTIQUE - LYCÉE MODERNE 1 D'ABOBO
 * Script Google Apps Script (Code.gs)
 * 
 * Ce script permet de recevoir les données de présence et la liste des élèves
 * envoyées depuis votre application web pure HTML/CSS/JS (hors-ligne et connectée).
 * 
 * INSTRUCTIONS DE DÉPLOIEMENT :
 * 1. Ouvrez votre Google Sheet (ou créez-en un nouveau sur drive.google.com).
 * 2. Cliquez dans le menu supérieur sur : Extensions > Apps Script.
 * 3. Supprimez tout le code existant dans l'éditeur et collez l'intégralité de ce fichier.
 * 4. Cliquez sur "Enregistrer" (icône disquette).
 * 5. Cliquez sur "Déployer" (bouton bleu en haut à droite) > "Nouveau déploiement".
 * 6. Sélectionnez le type : "Application Web" (icône engrenage).
 * 7. Remplissez :
 *    - Description : "Synchro Club Robotique"
 *    - Exécuter en tant que : "Moi (votre adresse email)"
 *    - Qui a accès : "Tout le monde" (Anyone) -> OBLIGATOIRE pour que l'application puisse envoyer les données
 * 8. Cliquez sur "Déployer", autorisez les autorisations d'accès Google.
 * 9. Copiez "l'URL de l'application Web" (qui se termine par /exec).
 * 10. Collez cette URL dans votre application HTML/JS locale !
 */

// Fonction appelée lors d'un test GET (vérification que le script fonctionne)
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = ss ? ss.getName() : "Classeur actif";
  
  var response = {
    status: "success",
    message: "Le script Apps Script du Club Robotique est actif et prêt à recevoir les présences !",
    spreadsheetName: sheetName,
    timestamp: new Date().toISOString()
  };
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Fonction appelée lors de l'envoi des données (POST) depuis l'application HTML/JS
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    // Attend jusqu'à 30 secondes pour éviter les conflits d'écriture simultanée
    lock.waitLock(30000);
    
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Classeur introuvable. Assurez-vous que le script est bien lié à une feuille Google Sheets.");
    }
    
    var students = data.students || [];
    var allAttendance = data.attendances || {};
    var nowFormatted = Utilities.formatDate(new Date(), "GMT", "dd/MM/yyyy HH:mm:ss");
    
    // ==========================================
    // 1. ONGLET "Élèves"
    // ==========================================
    var sheetStudents = ss.getSheetByName("Élèves");
    if (!sheetStudents) {
      sheetStudents = ss.insertSheet("Élèves", 0);
    }
    
    // Nettoie l'onglet
    sheetStudents.clear();
    
    // En-têtes Élèves
    var studentHeaders = [
      "N°", 
      "Matricule", 
      "Nom", 
      "Prénom", 
      "Sexe", 
      "Âge", 
      "Classe", 
      "Contact Parents", 
      "Statut"
    ];
    
    var studentRows = [];
    studentRows.push(studentHeaders);
    
    for (var i = 0; i < students.length; i++) {
      var s = students[i];
      studentRows.push([
        i + 1,
        s.matricule || s.id || "",
        (s.nom || "").toUpperCase(),
        s.prenom || "",
        s.sexe || "",
        s.age !== undefined && s.age !== null ? s.age : "",
        s.classe || "",
        s.contact || "",
        "Inscrit"
      ]);
    }
    
    if (studentRows.length > 0) {
      var rangeStudents = sheetStudents.getRange(1, 1, studentRows.length, studentHeaders.length);
      rangeStudents.setValues(studentRows);
      
      // Mise en forme moderne de l'en-tête
      var headerRange1 = sheetStudents.getRange(1, 1, 1, studentHeaders.length);
      headerRange1.setBackground("#0f172a"); // Slate 900
      headerRange1.setFontColor("#ffffff");
      headerRange1.setFontWeight("bold");
      sheetStudents.setFrozenRows(1);
      
      // Auto-dimensionnement des colonnes
      for (var col = 1; col <= studentHeaders.length; col++) {
        sheetStudents.autoResizeColumn(col);
      }
    }
    
    // ==========================================
    // 2. ONGLET "Présences (Synthèse)"
    // ==========================================
    var sheetPresences = ss.getSheetByName("Présences");
    if (!sheetPresences) {
      sheetPresences = ss.insertSheet("Présences", 1);
    }
    sheetPresences.clear();
    
    var presenceHeaders = [
      "Date Séance", 
      "Total Inscrits", 
      "Nombre Présents", 
      "Nombre Absents", 
      "Taux Présence (%)", 
      "Liste des Élèves Présents", 
      "Dernière Synchronisation"
    ];
    
    var presenceRows = [];
    presenceRows.push(presenceHeaders);
    
    var dates = Object.keys(allAttendance).sort().reverse();
    
    for (var d = 0; d < dates.length; d++) {
      var dateStr = dates[d];
      var dayRecord = allAttendance[dateStr] || {};
      
      var presentStudents = [];
      for (var j = 0; j < students.length; j++) {
        var st = students[j];
        if (dayRecord[st.id]) {
          presentStudents.push(st.nom + " " + st.prenom + " (" + st.classe + ")");
        }
      }
      
      var countPresent = presentStudents.length;
      var total = students.length;
      var countAbsent = total - countPresent;
      var rateStr = total > 0 ? ((countPresent / total) * 100).toFixed(1) + "%" : "0%";
      
      presenceRows.push([
        dateStr,
        total,
        countPresent,
        countAbsent,
        rateStr,
        presentStudents.join(", "),
        nowFormatted
      ]);
    }
    
    if (presenceRows.length > 0) {
      var rangePresence = sheetPresences.getRange(1, 1, presenceRows.length, presenceHeaders.length);
      rangePresence.setValues(presenceRows);
      
      var headerRange2 = sheetPresences.getRange(1, 1, 1, presenceHeaders.length);
      headerRange2.setBackground("#0d9488"); // Teal 600
      headerRange2.setFontColor("#ffffff");
      headerRange2.setFontWeight("bold");
      sheetPresences.setFrozenRows(1);
      
      for (var colP = 1; colP <= presenceHeaders.length; colP++) {
        sheetPresences.autoResizeColumn(colP);
      }
    }
    
    // ==========================================
    // 3. ONGLET "Détail_Appels"
    // ==========================================
    var sheetDetail = ss.getSheetByName("Détail_Appels");
    if (!sheetDetail) {
      sheetDetail = ss.insertSheet("Détail_Appels", 2);
    }
    sheetDetail.clear();
    
    var detailHeaders = [
      "Date Séance", 
      "Matricule", 
      "Nom", 
      "Prénom", 
      "Classe", 
      "Statut Présence", 
      "Horodatage Enregistrement"
    ];
    
    var detailRows = [];
    detailRows.push(detailHeaders);
    
    for (var d2 = 0; d2 < dates.length; d2++) {
      var dateKey = dates[d2];
      var dayAtt = allAttendance[dateKey] || {};
      
      for (var k = 0; k < students.length; k++) {
        var stud = students[k];
        var isPres = !!dayAtt[stud.id];
        
        detailRows.push([
          dateKey,
          stud.matricule || stud.id,
          stud.nom,
          stud.prenom,
          stud.classe,
          isPres ? "PRÉSENT" : "ABSENT",
          nowFormatted
        ]);
      }
    }
    
    if (detailRows.length > 0) {
      var rangeDetail = sheetDetail.getRange(1, 1, detailRows.length, detailHeaders.length);
      rangeDetail.setValues(detailRows);
      
      var headerRange3 = sheetDetail.getRange(1, 1, 1, detailHeaders.length);
      headerRange3.setBackground("#334155"); // Slate 700
      headerRange3.setFontColor("#ffffff");
      headerRange3.setFontWeight("bold");
      sheetDetail.setFrozenRows(1);
      
      for (var colD = 1; colD <= detailHeaders.length; colD++) {
        sheetDetail.autoResizeColumn(colD);
      }
    }
    
    // Libère le verrou
    lock.releaseLock();
    
    // Réponse JSON avec en-têtes CORS
    var output = {
      status: "success",
      message: "Synchronisation réussie avec succès vers Google Sheets !",
      studentsCount: students.length,
      datesCount: dates.length,
      updatedAt: nowFormatted
    };
    
    return ContentService.createTextOutput(JSON.stringify(output))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
