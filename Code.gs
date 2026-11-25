/**
 * CLUB ROBOTIQUE - LYCÉE MODERNE 1 D'ABOBO
 * Synchronisation Google Sheets (élèves, présences et détail des appels).
 */

var STUDENT_HEADERS = ["N°", "ID Carte", "Matricule", "Nom", "Prénom", "Sexe", "Âge", "Classe", "Contact Parents", "Statut", "ID Élève"];
var PRESENCE_HEADERS = ["Date Séance", "Total Inscrits", "Nombre Présents", "Nombre Absents", "Taux Présence (%)", "Liste des Présents", "Dernière Synchro"];
var DETAIL_HEADERS = ["Date Séance", "Matricule", "Nom", "Prénom", "Classe", "Statut Présence", "Horodatage Enregistrement", "ID Élève"];

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function normalizeText(value) {
  return String(value == null ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function normalizeHeader(value) {
  return normalizeText(value).replace(/[^A-Z0-9]+/g, " ").trim();
}

function findHeaderIndex(headers, aliases, fallback) {
  var normalized = headers.map(normalizeHeader);
  for (var i = 0; i < aliases.length; i++) {
    var index = normalized.indexOf(normalizeHeader(aliases[i]));
    if (index !== -1) return index;
  }
  return fallback;
}

function cell(row, index) {
  return index >= 0 && index < row.length ? row[index] : "";
}

function padZero(num, size) {
  var value = String(num);
  while (value.length < size) value = "0" + value;
  return value;
}

function normalizeCardId(value) {
  var cardId = String(value == null ? "" : value).trim();
  return /^\d+$/.test(cardId) ? padZero(cardId, 4) : cardId;
}

function normalizeStudents(input, requireNames) {
  if (!Array.isArray(input)) throw new Error("La liste des élèves doit être un tableau.");

  var students = input.map(function(source, index) {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      throw new Error("Fiche élève invalide à la ligne " + (index + 1) + ".");
    }

    var student = {
      idCarte: normalizeCardId(source.idCarte),
      id: String(source.id == null ? "" : source.id).trim(),
      matricule: String(source.matricule == null ? "" : source.matricule).trim(),
      nom: String(source.nom == null ? "" : source.nom).trim().toUpperCase(),
      prenom: String(source.prenom == null ? "" : source.prenom).trim(),
      sexe: normalizeText(source.sexe),
      age: parseAge(source.age),
      classe: String(source.classe == null ? "" : source.classe).trim(),
      contact: formatContactCI(source.contact)
    };

    if (requireNames && (!student.nom || !student.prenom)) {
      throw new Error("Nom et prénom obligatoires pour l'élève " + (index + 1) + ".");
    }
    student.sexe = student.sexe === "M" || student.sexe === "GARCON"
      ? "M"
      : student.sexe === "F" || student.sexe === "FILLE" ? "F" : "";
    return student;
  });

  var reservedCards = new Set();
  var maxNumericCard = 0;
  students.forEach(function(student) {
    if (!student.idCarte) return;
    reservedCards.add(student.idCarte.toUpperCase());
    if (/^\d+$/.test(student.idCarte)) {
      maxNumericCard = Math.max(maxNumericCard, Number(student.idCarte));
    }
  });

  var usedCards = new Set();
  var nextCardNumber = maxNumericCard + 1;
  students.forEach(function(student) {
    var cardKey = student.idCarte.toUpperCase();
    if (!student.idCarte || usedCards.has(cardKey)) {
      do {
        student.idCarte = padZero(nextCardNumber++, 4);
        cardKey = student.idCarte.toUpperCase();
      } while (reservedCards.has(cardKey) || usedCards.has(cardKey));
    }
    usedCards.add(cardKey);
  });

  var reservedIds = new Set();
  students.forEach(function(student) {
    if (student.id) reservedIds.add(student.id.toUpperCase());
  });
  var usedIds = new Set();
  students.forEach(function(student) {
    var baseId = student.id || student.matricule || "ELEVE-" + student.idCarte;
    var candidate = baseId;
    var suffix = 2;
    while (usedIds.has(candidate.toUpperCase()) ||
      (reservedIds.has(candidate.toUpperCase()) && (!student.id || candidate !== baseId))) {
      candidate = baseId + "-" + suffix++;
    }
    student.id = candidate;
    usedIds.add(candidate.toUpperCase());
  });

  return students;
}

function parseAge(value) {
  if (value === "" || value == null) return "";
  var age = Number(value);
  return isFinite(age) && age > 0 && age <= 100 ? age : "";
}

function normalizeStudentSheet(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), 11)).getValues();
  var headers = values[0];
  var hasCardColumn = findHeaderIndex(headers, ["ID Carte", "Carte"], -1) !== -1;
  var fallback = hasCardColumn
    ? { card: 1, matricule: 2, nom: 3, prenom: 4, sexe: 5, age: 6, classe: 7, contact: 8, id: 10 }
    : { card: -1, matricule: 1, nom: 2, prenom: 3, sexe: 4, age: 5, classe: 6, contact: 7, id: 9 };

  var columns = {
    card: findHeaderIndex(headers, ["ID Carte", "Carte"], fallback.card),
    matricule: findHeaderIndex(headers, ["Matricule"], fallback.matricule),
    nom: findHeaderIndex(headers, ["Nom"], fallback.nom),
    prenom: findHeaderIndex(headers, ["Prénom", "Prenom"], fallback.prenom),
    sexe: findHeaderIndex(headers, ["Sexe"], fallback.sexe),
    age: findHeaderIndex(headers, ["Âge", "Age"], fallback.age),
    classe: findHeaderIndex(headers, ["Classe"], fallback.classe),
    contact: findHeaderIndex(headers, ["Contact Parents", "Contact"], fallback.contact),
    id: findHeaderIndex(headers, ["ID Élève", "ID Eleve"], fallback.id)
  };

  var rawStudents = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var matricule = String(cell(row, columns.matricule) || "").trim();
    var nom = String(cell(row, columns.nom) || "").trim();
    if (!nom && !matricule) continue;

    var sexe = normalizeText(cell(row, columns.sexe));
    rawStudents.push({
      idCarte: cell(row, columns.card) || "",
      id: String(cell(row, columns.id) || "").trim(),
      matricule: matricule,
      nom: nom,
      prenom: String(cell(row, columns.prenom) || "").trim(),
      sexe: sexe === "M" || sexe === "GARCON" ? "M" : sexe === "F" || sexe === "FILLE" ? "F" : "",
      age: cell(row, columns.age),
      classe: String(cell(row, columns.classe) || "").trim(),
      contact: cell(row, columns.contact)
    });
  }
  return normalizeStudents(rawStudents, false);
}

function normalizeDateKey(value, timeZone) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timeZone, "yyyy-MM-dd");
  }
  return String(value == null ? "" : value).trim();
}

function readAttendances(ss) {
  var sheet = ss.getSheetByName("Détail_Appels");
  var attendances = {};
  if (!sheet || sheet.getLastRow() < 2) return attendances;

  var values = sheet.getRange(1, 1, sheet.getLastRow(), Math.max(sheet.getLastColumn(), 8)).getValues();
  var headers = values[0];
  var columns = {
    date: findHeaderIndex(headers, ["Date Séance", "Date"], 0),
    matricule: findHeaderIndex(headers, ["Matricule"], 1),
    status: findHeaderIndex(headers, ["Statut Présence", "Statut"], 5),
    id: findHeaderIndex(headers, ["ID Élève", "ID Eleve"], 7)
  };
  var timeZone = ss.getSpreadsheetTimeZone();

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var date = normalizeDateKey(cell(row, columns.date), timeZone);
    var studentId = String(cell(row, columns.id) || cell(row, columns.matricule) || "").trim();
    var status = normalizeText(cell(row, columns.status));
    if (!date || !studentId) continue;
    if (!attendances[date]) attendances[date] = {};
    attendances[date][studentId] = status === "PRESENT";
  }
  return attendances;
}

function doGet() {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    lock.waitLock(30000);
    lockAcquired = true;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Classeur Google Sheets introuvable.");
    var students = normalizeStudentSheet(ss.getSheetByName("Élèves"));
    return jsonResponse({
      status: "success",
      spreadsheetName: ss.getName(),
      studentsCount: students.length,
      students: students,
      attendances: readAttendances(ss),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("Erreur lecture Google Sheets:", err);
    return jsonResponse({ status: "error", message: err.message || String(err) });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function getOrCreateSheet(ss, name, index) {
  return ss.getSheetByName(name) || ss.insertSheet(name, index);
}

function backupSheet(ss, sheet, prefix) {
  var backupName = prefix + "_" + new Date().getTime();
  sheet.copyTo(ss).setName(backupName);
}

function writeTable(sheet, rows, headerColor, textColumns) {
  sheet.clearContents();
  textColumns.forEach(function(column) {
    sheet.getRange(1, column, Math.max(rows.length, 1), 1).setNumberFormat("@");
  });
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
  sheet.getRange(1, 1, 1, rows[0].length)
    .setBackground(headerColor)
    .setFontColor("#ffffff")
    .setFontWeight("bold");
  sheet.setFrozenRows(1);
  for (var column = 1; column <= rows[0].length; column++) {
    sheet.autoResizeColumn(column);
  }
}

function isStudentPresent(dayAttendance, student, uniqueMatricules) {
  return Boolean(
    dayAttendance[student.id] ||
    dayAttendance[student.idCarte] ||
    (student.matricule && uniqueMatricules.get(student.matricule) === 1 && dayAttendance[student.matricule])
  );
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("Corps de requête manquant.");
    }
    var data = JSON.parse(e.postData.contents);
    if (data.action === "read" || data.action === "get") return doGet();

    var students = normalizeStudents(data.students, true);
    var allAttendance = data.attendances || {};
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error("Classeur Google Sheets introuvable.");
    lock.waitLock(30000);
    lockAcquired = true;

    var timeZone = ss.getSpreadsheetTimeZone();
    var now = new Date();
    var nowFormatted = Utilities.formatDate(now, timeZone, "dd/MM/yyyy HH:mm:ss");
    var studentRows = [STUDENT_HEADERS];
    var matriculeCounts = new Map();

    students.forEach(function(student, index) {
      if (student.matricule) {
        matriculeCounts.set(student.matricule, (matriculeCounts.get(student.matricule) || 0) + 1);
      }
      studentRows.push([
        index + 1,
        student.idCarte,
        student.matricule,
        student.nom,
        student.prenom,
        student.sexe,
        student.age,
        student.classe,
        student.contact,
        "Inscrit",
        student.id
      ]);
    });

    var dates = Object.keys(allAttendance).sort().reverse();
    var presenceRows = [PRESENCE_HEADERS];
    var detailRows = [DETAIL_HEADERS];
    dates.forEach(function(date) {
      var dayAttendance = allAttendance[date];
      var presentStudents = [];
      students.forEach(function(student) {
        var present = isStudentPresent(dayAttendance, student, matriculeCounts);
        if (present) {
          presentStudents.push(student.nom + " " + student.prenom + " (" + student.classe + ")");
        }
        detailRows.push([
          date,
          student.matricule,
          student.nom,
          student.prenom,
          student.classe,
          present ? "PRÉSENT" : "ABSENT",
          nowFormatted,
          student.id
        ]);
      });

      var total = students.length;
      presenceRows.push([
        date,
        total,
        presentStudents.length,
        total - presentStudents.length,
        total ? ((presentStudents.length / total) * 100).toFixed(1) + "%" : "0%",
        presentStudents.join(", "),
        nowFormatted
      ]);
    });

    writeTable(getOrCreateSheet(ss, "Élèves", 0), studentRows, "#0f172a", [2, 3, 4, 5, 6, 8, 9, 10, 11]);
    writeTable(getOrCreateSheet(ss, "Présences", 1), presenceRows, "#0d9488", [1, 6, 7]);
    writeTable(getOrCreateSheet(ss, "Détail_Appels", 2), detailRows, "#334155", [1, 2, 3, 4, 5, 6, 7, 8]);

    return jsonResponse({
      status: "success",
      message: "Synchronisation réussie.",
      spreadsheetName: ss.getName(),
      studentsCount: students.length,
      datesCount: dates.length,
      updatedAt: now.toISOString()
    });
  } catch (err) {
    console.error("Erreur synchronisation Google Sheets:", err);
    return jsonResponse({ status: "error", message: err.message || String(err) });
  } finally {
    if (lockAcquired) lock.releaseLock();
  }
}

function formatContactCI(value) {
  if (value == null || value === "") return "";
  var contact = String(value).trim();
  if (!contact) return "";
  if (contact.indexOf("/") !== -1) {
    return contact.split("/").map(function(phone) {
      return formatSinglePhone(phone.trim());
    }).filter(Boolean).join(" / ");
  }
  return formatSinglePhone(contact);
}

function formatSinglePhone(phone) {
  if (!phone) return "";
  var digits = String(phone).replace(/[^0-9]/g, "");
  if (digits.length === 9 && ["1", "5", "7", "2"].indexOf(digits.charAt(0)) !== -1) {
    return "0" + digits;
  }
  if (digits.length === 10 && digits.charAt(0) === "0") return digits;
  return String(phone).trim();
}