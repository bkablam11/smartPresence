/**
 * CLUB ROBOTIQUE - LYCÉE MODERNE 1 D'ABOBO
 * Script Google Apps Script (Code.gs)
 * Base de données Google Sheets bi-directionnelle (Lecture et Écriture)
 * 
 * Ce script permet à votre application Web HTML/CSS/JS :
 * 1. DE LIRE (doGet) : Récupère la liste des élèves et l'historique des présences depuis Google Sheets.
 * 2. D'ÉCRIRE (doPost) : Enregistre les élèves, les statistiques et le détail des appels dans Google Sheets.
 * 
 * INSTRUCTIONS POUR METTRE À JOUR VOTRE SCRIPT DANS GOOGLE SHEETS :
 * 1. Dans votre Google Sheet ("smartPresence"), cliquez sur : Extensions > Apps Script.
 * 2. Remplacez tout le code par ce fichier complet.
 * 3. Cliquez sur "Enregistrer" (icône disquette).
 * 4. Cliquez sur "Déployer" > "Gérer les déploiements" > Icône Crayon (Modifier)
 *    -> Version : "Nouvelle version"
 *    -> Cliquez sur "Déployer".
 * (L'URL /exec reste exactement la même !)
 */

// 1. LECTURE (GET) : L'application récupère les données de Google Sheets
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Classeur Google Sheets introuvable."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // --- LECTURE ONGLET "Élèves" ---
    var sheetStudents = ss.getSheetByName("Élèves");
    var students = [];
    
    if (sheetStudents && sheetStudents.getLastRow() > 1) {
      var lastRow = sheetStudents.getLastRow();
      var lastCol = Math.max(sheetStudents.getLastColumn(), 8);
      var values = sheetStudents.getRange(2, 1, lastRow - 1, lastCol).getValues();
      
      for (var i = 0; i < values.length; i++) {
        var row = values[i];
        // En-têtes attendus : [N°, Matricule, Nom, Prénom, Sexe, Âge, Classe, Contact Parents, Statut]
        var matricule = String(row[1] || "").trim();
        var nom = String(row[2] || "").trim();
        var prenom = String(row[3] || "").trim();
        var sexe = String(row[4] || "").trim().toUpperCase();
        var age = row[5] ? parseInt(row[5], 10) : "";
        var classe = String(row[6] || "").trim();
        var contact = formatContactCI(row[7]);
        
        if (nom || matricule) {
          students.push({
            id: matricule || ("STU-" + (i + 1)),
            matricule: matricule,
            nom: nom,
            prenom: prenom,
            sexe: (sexe === "M" || sexe === "GARÇON" || sexe === "GARCON") ? "M" : "F",
            age: age || "",
            classe: classe,
            contact: contact
          });
        }
      }
    }
    
    // --- LECTURE ONGLET "Détail_Appels" (Historique des présences) ---
    var sheetDetail = ss.getSheetByName("Détail_Appels");
    var attendances = {}; // { [date]: { [studentId]: boolean } }
    
    if (sheetDetail && sheetDetail.getLastRow() > 1) {
      var lastDetailRow = sheetDetail.getLastRow();
      var detailValues = sheetDetail.getRange(2, 1, lastDetailRow - 1, 6).getValues();
      
      for (var j = 0; j < detailValues.length; j++) {
        var dRow = detailValues[j];
        // [Date Séance, Matricule, Nom, Prénom, Classe, Statut Présence]
        var dDate = String(dRow[0] || "").trim();
        var dMatricule = String(dRow[1] || "").trim();
        var dStatut = String(dRow[5] || "").trim().toUpperCase();
        
        if (dDate && dMatricule) {
          if (!attendances[dDate]) {
            attendances[dDate] = {};
          }
          attendances[dDate][dMatricule] = (dStatut === "PRÉSENT" || dStatut === "PRESENT");
        }
      }
    }
    
    var response = {
      status: "success",
      message: "Données chargées avec succès depuis Google Sheets !",
      spreadsheetName: ss.getName(),
      studentsCount: students.length,
      students: students,
      attendances: attendances,
      timestamp: new Date().toISOString()
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Erreur lecture Google Sheets: " + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. ÉCRITURE (POST) : L'application enregistre les données dans Google Sheets
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(30000);
    
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      throw new Error("Classeur introuvable. Assurez-vous que le script est lié à votre feuille Google Sheets.");
    }
    
    // Si l'action demandée est juste une lecture via POST
    if (data.action === "read" || data.action === "get") {
      lock.releaseLock();
      return doGet(e);
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
    sheetStudents.clear();
    // Forcer la colonne H (Contact Parents) au format Texte Brut ("@") pour conserver le 0 initial
    sheetStudents.getRange("H:H").setNumberFormat("@");
    
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
        formatContactCI(s.contact || ""),
        "Inscrit"
      ]);
    }
    
    if (studentRows.length > 0) {
      sheetStudents.getRange(1, 8, studentRows.length, 1).setNumberFormat("@");
      var rangeStudents = sheetStudents.getRange(1, 1, studentRows.length, studentHeaders.length);
      rangeStudents.setValues(studentRows);
      sheetStudents.getRange(1, 8, studentRows.length, 1).setNumberFormat("@");
      
      var headerRange1 = sheetStudents.getRange(1, 1, 1, studentHeaders.length);
      headerRange1.setBackground("#0f172a"); // Slate 900
      headerRange1.setFontColor("#ffffff");
      headerRange1.setFontWeight("bold");
      sheetStudents.setFrozenRows(1);
      
      for (var col = 1; col <= studentHeaders.length; col++) {
        sheetStudents.autoResizeColumn(col);
      }
    }
    
    // ==========================================
    // 2. ONGLET "Présences" (Synthèse globale par date)
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
        if (dayRecord[st.id] || dayRecord[st.matricule]) {
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
    // 3. ONGLET "Détail_Appels" (Ligne par ligne)
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
        var isPres = !!(dayAtt[stud.id] || dayAtt[stud.matricule]);
        
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
    
    lock.releaseLock();
    
    var output = {
      status: "success",
      message: "Synchronisation réussie avec succès vers Google Sheets !",
      spreadsheetName: ss.getName(),
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

// ==========================================
// 3. FONCTIONS UTILITAIRES DE FORMATAGE
// ==========================================

/**
 * Normalise les contacts téléphoniques de Côte d'Ivoire (10 chiffres).
 * Si Google Sheets a supprimé le zéro initial (ex: 757882699 ou 506135513),
 * cette fonction restaure le "0" (ex: 0757882699 ou 0506135513).
 */
function formatContactCI(val) {
  if (!val && val !== 0) return "";
  var str = String(val).trim();
  if (!str) return "";
  if (str.indexOf("/") !== -1) {
    return str.split("/").map(function(p) { return formatSinglePhoneCI(p.trim()); }).filter(Boolean).join(" / ");
  }
  return formatSinglePhoneCI(str);
}

function formatSinglePhoneCI(p) {
  if (!p) return "";
  var digits = p.replace(/[^0-9]/g, "");
  // Si le numéro a 9 chiffres et commence par 1, 5, 7 ou 2, il lui manque le 0 initial
  if (digits.length === 9 && (digits[0] === '1' || digits[0] === '5' || digits[0] === '7' || digits[0] === '2')) {
    return "0" + digits;
  }
  // Si déjà 10 chiffres commençant par 0
  if (digits.length === 10 && digits[0] === '0') {
    return digits;
  }
  return p;
}

/**
 * Déclencheur automatique lorsque quelqu'un saisit un numéro directement dans Google Sheets :
 * Si un utilisateur tape un contact sans le 0 (ex: 757882699 ou 0757882699),
 * la cellule est immédiatement convertie en texte avec le 0 initial conservé !
 */
function onEdit(e) {
  try {
    if (!e || !e.range) return;
    var range = e.range;
    var sheet = range.getSheet();
    if (sheet.getName() === "Élèves" && range.getColumn() === 8 && range.getRow() > 1) {
      var val = e.value;
      if (val) {
        var formatted = formatContactCI(val);
        range.setNumberFormat("@");
        if (formatted !== val) {
          range.setValue(formatted);
        }
      }
    }
  } catch (err) {
    // Ne bloque pas la saisie en cas d'erreur mineure
  }
}
