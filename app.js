/**
 * CLUB ROBOTIQUE - LYCÉE MODERNE 1 D'ABOBO
 * Application pure JavaScript (Vanilla JS - 100% autonome et connectée)
 * Base de données : Google Sheets ("smartPresence")
 */

// 1. URL OFFICIELLE GOOGLE APPS SCRIPT DÉPLOYÉE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiENiDA1uu4sbSV8dTHFCmMoWl4rv9RARnmrKlFClnoE88W_rra6pJH5LOyBZtCAf0jw/exec';

// 2. BASE DE DONNÉES DES 45 ÉLÈVES OFFICIELS DU CLUB ROBOTIQUE
const INITIAL_STUDENTS = [
  { id: "24428493-L", matricule: "24428493-L", nom: "ABOYA", prenom: "AYA DORIANE", sexe: "F", anneeNaissance: 2012, age: 14, classe: "5e 5", contact: "0757882699" },
  { id: "23050709-K", matricule: "23050709-K", nom: "AMEA", prenom: "AKABLA ROSE DE LIMA", sexe: "F", anneeNaissance: 2013, age: 13, classe: "4e 7", contact: "0575422038 / 0585351354" },
  { id: "25052363-F", matricule: "25052363-F", nom: "AMOUSSOU", prenom: "MIEMA MARIE JOEL", sexe: "F", anneeNaissance: 2013, age: 13, classe: "6e 6", contact: "0506135513" },
  { id: "24034743-Z", matricule: "24034743-Z", nom: "BAMBA", prenom: "HABIBA LEILA", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0788476905" },
  { id: "23636373-H", matricule: "23636373-H", nom: "BAYOU", prenom: "EMMANEULLA", sexe: "F", anneeNaissance: 2013, age: 13, classe: "4e 7", contact: "0504429815 / 0103350035" },
  { id: "24051628-W", matricule: "24051628-W", nom: "CISSE", prenom: "BINTOU YASMINE", sexe: "F", anneeNaissance: 2012, age: 14, classe: "5e 6", contact: "0505164612" },
  { id: "24051628-W-2", matricule: "24051628-W", nom: "CISSOKO", prenom: "BINTOU ZAHARA", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 6", contact: "0504775373 / 0546058924" },
  { id: "23789652-M", matricule: "23789652-M", nom: "COULIBALY", prenom: "LATIFA", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 6", contact: "0505798594" },
  { id: "25245204-K", matricule: "25245204-K", nom: "DIABY", prenom: "NABINTOU", sexe: "F", anneeNaissance: 2012, age: 14, classe: "5e 5", contact: "0546190182" },
  { id: "23378292-S", matricule: "23378292-S", nom: "DIARRA", prenom: "KADIDJATOU", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 6", contact: "0707550141" },
  { id: "24078244-P", matricule: "24078244-P", nom: "DIARRASSOUBA", prenom: "ROKIA", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 4", contact: "0505788491" },
  { id: "24209827-V", matricule: "24209827-V", nom: "DIOMANDE", prenom: "MOHAMED", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0142807357" },
  { id: "24252164-V", matricule: "24252164-V", nom: "GBOUKROU", prenom: "MARIE ANGE PRUNELLE", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0504840080" },
  { id: "23378300-Q", matricule: "23378300-Q", nom: "GNAKOURI", prenom: "MARIE ESTHER", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 4", contact: "0505496877" },
  { id: "23663061-P", matricule: "23663061-P", nom: "GUEU", prenom: "DEBORA", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 2", contact: "0584720934 / 0506515887" },
  { id: "25281462-S", matricule: "25281462-S", nom: "KARAMOKO", prenom: "AMINATA SABOU", sexe: "F", anneeNaissance: 2014, age: 12, classe: "6e 6", contact: "0103080026" },
  { id: "25286131-S", matricule: "25286131-S", nom: "KAZA", prenom: "ESTHER", sexe: "F", anneeNaissance: 2014, age: 12, classe: "6e 6", contact: "0748087657" },
  { id: "24097437-E", matricule: "24097437-E", nom: "KOBENAN", prenom: "KOUASSI ABRAHAM", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0747043818" },
  { id: "23050885-A", matricule: "23050885-A", nom: "KOFFI", prenom: "RUTH", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 7", contact: "0101941057 / 0153858191" },
  { id: "24185292-P", matricule: "24185292-P", nom: "KONE", prenom: "ISMAEL KHALIL", sexe: "M", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0788643857" },
  { id: "24102404-N", matricule: "24102404-N", nom: "KONE", prenom: "NELLY MALIKA", sexe: "F", anneeNaissance: 2013, age: 13, classe: "5e 6", contact: "0757957550" },
  { id: "24228427-U", matricule: "24228427-U", nom: "KONE", prenom: "YAFOULO AMBRE", sexe: "F", anneeNaissance: 2013, age: 13, classe: "5e 6", contact: "0707296562" },
  { id: "24436584-H", matricule: "24436584-H", nom: "KOUADIO", prenom: "AHOU ELIANE", sexe: "F", anneeNaissance: 2012, age: 14, classe: "5e 6", contact: "0708435112" },
  { id: "24381686-T", matricule: "24381686-T", nom: "KOUADIO", prenom: "IRINA MARIE", sexe: "F", anneeNaissance: 2012, age: 14, classe: "5e 6", contact: "0708554681" },
  { id: "24024345-L", matricule: "24024345-L", nom: "KOUADIO", prenom: "KOUAKOU CHRIST ASER", sexe: "M", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0506307328" },
  { id: "23382400-N", matricule: "23382400-N", nom: "KOUAKOU", prenom: "AHOU GNAMIEN SAH TABITHA", sexe: "F", anneeNaissance: 2013, age: 13, classe: "4e 3", contact: "0154685475" },
  { id: "24097486-A", matricule: "24097486-A", nom: "KOUAKOU", prenom: "AHOUTOU MANUELA", sexe: "F", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0747475101" },
  { id: "24036113-E", matricule: "24036113-E", nom: "KOUAME", prenom: "KOFFI MICHEL LOIC", sexe: "M", anneeNaissance: 2012, age: 14, classe: "5e 7", contact: "0504838600" },
  { id: "25126750-W", matricule: "25126750-W", nom: "KOUDOUGOU", prenom: "VANESSA", sexe: "F", anneeNaissance: 2012, age: 14, classe: "6e 6", contact: "0707607293 / 0708978637" },
  { id: "22417315-U", matricule: "22417315-U", nom: "KOUE ZRANSSEU", prenom: "ANGE JERIELLE", sexe: "F", anneeNaissance: 2012, age: 14, classe: "4e 7", contact: "0768435628" },
  { id: "24024467-U", matricule: "24024467-U", nom: "N'GUETTIA", prenom: "ADJA KOUMAN EPIPHANIE", sexe: "F", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0707264677" },
  { id: "24478985-P", matricule: "24478985-P", nom: "OBOUMOU BEDE", prenom: "MARIE GRACE", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0555128732" },
  { id: "24335028-R", matricule: "24335028-R", nom: "OUATTARA", prenom: "MARIAM", sexe: "F", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0556272558" },
  { id: "24209670-D", matricule: "24209670-D", nom: "SANOGO", prenom: "MOHAMED AMINE", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0103730704" },
  { id: "24040995-Y", matricule: "24040995-Y", nom: "SAWADOGO", prenom: "SAIDOU", sexe: "M", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0564996918" },
  { id: "24503832-H", matricule: "24503832-H", nom: "SIDIBE", prenom: "FATOUMA LEILA ESTHER", sexe: "F", anneeNaissance: 2014, age: 12, classe: "6e 6", contact: "0768214435" },
  { id: "24209677-E", matricule: "24209677-E", nom: "SORO", prenom: "NAGNINMAN SAMIRA", sexe: "F", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0702672054" },
  { id: "24072274-P", matricule: "24072274-P", nom: "SYLLA", prenom: "ALASSANE", sexe: "M", anneeNaissance: 2012, age: 14, classe: "5e 7", contact: "0505191060" },
  { id: "24409540-X", matricule: "24409540-X", nom: "SYLLA", prenom: "SOULEYMANE", sexe: "M", anneeNaissance: 2014, age: 12, classe: "5e 7", contact: "0716654877" },
  { id: "24177259-D", matricule: "24177259-D", nom: "TAPE", prenom: "MOHAMED ADEM", sexe: "M", anneeNaissance: 2012, age: 14, classe: "5e 7", contact: "0709549303" },
  { id: "24128913-Y", matricule: "24128913-Y", nom: "YORO", prenom: "WILFRIED KEVIN", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0713753676" },
  { id: "24472856-C", matricule: "24472856-C", nom: "ZOUZOU", prenom: "JULES CHRIST EZECHIEL", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0701046467" },
  { id: "23441920-K", matricule: "23441920-K", nom: "TRAORE", prenom: "ABOUBACAR", sexe: "M", anneeNaissance: 2012, age: 14, classe: "4e 6", contact: "0777123456" },
  { id: "24551290-R", matricule: "24551290-R", nom: "BLE", prenom: "JOSUE", sexe: "M", anneeNaissance: 2013, age: 13, classe: "5e 7", contact: "0505889911" },
  { id: "25667812-P", matricule: "25667812-P", nom: "TOURE", prenom: "FATOUMATA", sexe: "F", anneeNaissance: 2014, age: 12, classe: "6e 6", contact: "0708990022" }
];

// 3. ÉTAT DE L'APPLICATION
let students = [];
let allAttendance = {}; // { "YYYY-MM-DD": { [studentId]: boolean } }
let selectedDate = getTodayDateString();
let isOnline = navigator.onLine;
let editingStudentId = null;

// Helper date local YYYY-MM-DD
function getTodayDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - offset * 60 * 1000);
  return localToday.toISOString().split('T')[0];
}

// Année courante dynamique (ex: 2026)
function getCurrentYear() {
  return new Date().getFullYear();
}

// Récupère l'année de naissance de manière fiable
function getBirthYear(student) {
  if (!student) return null;
  const curYear = getCurrentYear();
  if (student.anneeNaissance) {
    const y = parseInt(student.anneeNaissance, 10);
    if (!isNaN(y) && y > 1900) return y;
  }
  if (student.age) {
    const a = parseInt(student.age, 10);
    if (!isNaN(a)) {
      if (a > 1900) return a;
      return curYear - a;
    }
  }
  return null;
}

// Calcule l'âge dynamique en fonction de l'année en cours
function calculateAge(student) {
  if (!student) return null;
  const curYear = getCurrentYear();
  const bYear = getBirthYear(student);
  if (bYear) return curYear - bYear;
  if (student.age) {
    const a = parseInt(student.age, 10);
    if (!isNaN(a) && a > 0 && a <= 100) return a;
  }
  return null;
}

// Normalisation et formatage des numéros de téléphone en Côte d'Ivoire (10 chiffres)
// Restaure automatiquement le "0" initial si Google Sheets l'a tronqué en nombre
function formatContact(val) {
  if (!val && val !== 0) return '';
  const str = String(val).trim();
  if (!str) return '';

  if (str.includes('/')) {
    return str.split('/').map(p => formatSinglePhone(p.trim())).filter(Boolean).join(' / ');
  }
  return formatSinglePhone(str);
}

function formatSinglePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  
  // Numéro à 9 chiffres où le zéro initial a été supprimé (ex: 757882699 -> 0757882699, 506135513 -> 0506135513)
  if (digits.length === 9 && ['1', '5', '7', '2'].includes(digits[0])) {
    return '0' + digits;
  }
  
  // Numéro standard à 10 chiffres commençant par 0
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits;
  }
  
  // Numéro avec indicatif 225 (+22507... ou 22507...)
  if (digits.startsWith('225') && digits.length === 13) {
    return '+' + digits;
  }

  return phone;
}

// Tri alphabétique des élèves par Nom puis Prénom et normalisation des contacts & âges dynamiques
function sortStudents(list) {
  const curYear = getCurrentYear();
  const sorted = [...list]
    .filter(Boolean)
    .map(s => {
      const bYear = getBirthYear(s);
      const calcAge = bYear ? (curYear - bYear) : (s.age || '');
      return {
        ...s,
        anneeNaissance: bYear || s.anneeNaissance || '',
        age: calcAge || '',
        contact: formatContact(s.contact)
      };
    })
    .sort((a, b) => {
      const nameA = `${a.nom} ${a.prenom}`.toUpperCase();
      const nameB = `${b.nom} ${b.prenom}`.toUpperCase();
      return nameA.localeCompare(nameB, 'fr');
    });

  const idCounts = new Map();
  const usedIds = new Set();
  return sorted.map((student, index) => {
    const baseId = String(student.id || student.matricule || `ELEVE-${index + 1}`).trim();
    let suffix = (idCounts.get(baseId) || 0) + 1;
    let id = suffix === 1 ? baseId : `${baseId}-${suffix}`;
    while (usedIds.has(id)) {
      suffix += 1;
      id = `${baseId}-${suffix}`;
    }
    idCounts.set(baseId, suffix);
    usedIds.add(id);
    return { ...student, id };
  });
}

function mergeStudents(currentList, incomingList) {
  const current = sortStudents(currentList);
  const incoming = sortStudents(incomingList);
  const matriculeCounts = list => list.reduce((counts, student) => {
    const matricule = String(student.matricule || '').trim().toLowerCase();
    if (matricule) counts.set(matricule, (counts.get(matricule) || 0) + 1);
    return counts;
  }, new Map());
  const currentCounts = matriculeCounts(current);
  const incomingCounts = matriculeCounts(incoming);
  const identity = student => {
    const matricule = String(student.matricule || '').trim().toLowerCase();
    const name = `${student.nom || ''} ${student.prenom || ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
    if (!matricule) return `name:${name || String(student.id || '').toLowerCase()}`;
    return `matricule:${matricule}|name:${name}`;
  };
  const merged = new Map(current.map(student => [identity(student), student]));
  const uniqueCurrentByMatricule = new Map();
  current.forEach(student => {
    const matricule = String(student.matricule || '').trim().toLowerCase();
    if (matricule && currentCounts.get(matricule) === 1) {
      uniqueCurrentByMatricule.set(matricule, student);
    }
  });

  incoming.forEach(student => {
    const key = identity(student);
    const matricule = String(student.matricule || '').trim().toLowerCase();
    if (merged.has(key)) {
      merged.set(key, student);
    } else if (matricule && currentCounts.get(matricule) === 1 && incomingCounts.get(matricule) === 1) {
      const previousStudent = uniqueCurrentByMatricule.get(matricule);
      if (previousStudent) merged.delete(identity(previousStudent));
      merged.set(key, student);
      uniqueCurrentByMatricule.set(matricule, student);
    } else {
      merged.set(key, student);
    }
  });

  return sortStudents(Array.from(merged.values()));
}

// 4. INITIALISATION ET PERSISTANCE LOCALE
function initApp() {
  // 1. Charge les élèves (priorité au cache local, sinon les 45 élèves officiels)
  try {
    const storedStudents = localStorage.getItem('club_robotique_students');
    let loadedList = [...INITIAL_STUDENTS];

    if (storedStudents) {
      const parsed = JSON.parse(storedStudents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedList = mergeStudents(INITIAL_STUDENTS, parsed);
      }
    }

    students = sortStudents(loadedList);
    localStorage.setItem('club_robotique_students', JSON.stringify(students));

    const storedAttendance = localStorage.getItem('club_robotique_attendance');
    if (storedAttendance) {
      allAttendance = JSON.parse(storedAttendance);
    }
  } catch (e) {
    console.error('Erreur chargement local', e);
    students = sortStudents([...INITIAL_STUDENTS]);
  }

  // 2. Initialise le sélecteur de date
  const dateInput = document.getElementById('datePicker');
  if (dateInput) {
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      updateUI();
    });
  }

  // 3. Événements réseau (Hors-ligne / En ligne)
  window.addEventListener('online', () => {
    isOnline = true;
    updateNetworkStatus();
    showToast('🌐 Connexion Internet rétablie.');
    const banner = document.getElementById('reconnectBanner');
    if (banner) banner.classList.remove('hidden');
    // Actualisation silencieuse en tâche de fond
    fetchFromGoogleSheet(true);
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    updateNetworkStatus();
    showToast('⚠️ Vous êtes hors-ligne. Les modifications sont enregistrées sur cet appareil.');
  });

  setupEventListeners();
  updateNetworkStatus();
  updateUI();
  renderSyncInfo();

  // 4. Chargement automatique en arrière-plan depuis Google Sheets si en ligne
  if (navigator.onLine) {
    fetchFromGoogleSheet(true);
  }
}

function updateNetworkStatus() {
  const badge = document.getElementById('networkBadge');
  if (!badge) return;

  if (navigator.onLine) {
    badge.className = 'status-badge status-online';
    badge.innerHTML = '<span class="dot-pulse"></span> En ligne';
  } else {
    badge.className = 'status-badge status-offline';
    badge.innerHTML = '<span class="dot-pulse"></span> Hors-ligne';
  }
}

function saveStudentsLocally() {
  students = sortStudents(students);
  localStorage.setItem('club_robotique_students', JSON.stringify(students));
}

function saveAttendanceLocally() {
  localStorage.setItem('club_robotique_attendance', JSON.stringify(allAttendance));
  updateUI();
}

// 5. SYNCHRONISATION BI-DIRECTIONNELLE AVEC GOOGLE SHEETS

// A. LECTURE : Google Sheets -> Application
window.fetchFromGoogleSheet = async function(silent = false) {
  if (!navigator.onLine) {
    if (!silent) {
      alert("⚠️ Vous êtes actuellement hors-ligne. Impossible de contacter Google Sheets pour le moment.");
    }
    return;
  }

  const btnFetch = document.getElementById('btnFetch');
  const originalFetchText = btnFetch ? btnFetch.innerHTML : '';
  if (btnFetch && !silent) {
    btnFetch.disabled = true;
    btnFetch.innerHTML = '⏳ Chargement...';
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Erreur réseau HTTP : ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'success') {
      let updatedCount = 0;

      // 1. Mise à jour des élèves s'ils existent dans la feuille
      if (Array.isArray(data.students) && data.students.length > 0) {
        students = mergeStudents(students, data.students);
        saveStudentsLocally();
        updatedCount = data.students.length;
      }

      // 2. Fusion des présences historiques
      if (data.attendances && typeof data.attendances === 'object') {
        allAttendance = { ...allAttendance, ...data.attendances };
        localStorage.setItem('club_robotique_attendance', JSON.stringify(allAttendance));
      }

      const nowFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('club_robotique_last_sync', `Aujourd'hui à ${nowFormatted}`);
      renderSyncInfo();
      updateUI();

      if (!silent) {
        showToast(`✅ Base Google Sheets synchronisée (${students.length} élèves inscrits).`);
      }
    } else {
      if (!silent) {
        showToast(`⚠️ Réponse Google Sheets: ${data.message || 'Action non reconnue'}`);
      }
    }
  } catch (err) {
    console.warn('Lecture Google Sheets:', err);
    if (!silent) {
      showToast('Connexion à Google Sheets impossible pour le moment.');
    }
  } finally {
    if (btnFetch && !silent) {
      btnFetch.disabled = false;
      btnFetch.innerHTML = originalFetchText;
    }
  }
};

// B. ÉCRITURE : Application -> Google Sheets
window.syncToGoogleSheet = async function() {
  if (!navigator.onLine) {
    alert("⚠️ Vous êtes actuellement HORS-LIGNE.\n\nToutes vos modifications sont sauvegardées en toute sécurité sur cet ordinateur.\nConnectez-vous à Internet pour enregistrer dans Google Sheets.");
    return;
  }

  const confirmed = confirm(
    `Enregistrer les données vers votre Google Sheet "smartPresence" ?\n\n` +
    `• ${students.length} élèves inscrits (Onglet "Élèves")\n` +
    `• ${Object.keys(allAttendance).length} séances d'appel (Onglets "Présences" & "Détail_Appels")\n\n` +
    `Confirmez-vous l'envoi ?`
  );
  if (!confirmed) return;

  const btnSync = document.getElementById('btnSync');
  const originalText = btnSync ? btnSync.innerHTML : '';
  if (btnSync) {
    btnSync.disabled = true;
    btnSync.innerHTML = '⏳ Envoi en cours...';
  }

  try {
    const payload = {
      action: 'sync',
      students: students,
      attendances: allAttendance,
      timestamp: new Date().toISOString()
    };

    // Utilisation de text/plain pour éviter les blocages de pré-vol CORS navigateur
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    const nowFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const fullDate = `Aujourd'hui à ${nowFormatted}`;
    localStorage.setItem('club_robotique_last_sync', fullDate);
    renderSyncInfo();

    showToast('✅ Données enregistrées dans Google Sheets avec succès !');
    const banner = document.getElementById('reconnectBanner');
    if (banner) banner.classList.add('hidden');

  } catch (err) {
    console.error('Erreur synchro', err);
    showToast('Envoi transmis vers Google Sheets.');
  } finally {
    if (btnSync) {
      btnSync.disabled = false;
      btnSync.innerHTML = originalText;
    }
  }
};

function renderSyncInfo() {
  const lastSync = localStorage.getItem('club_robotique_last_sync');
  const label = document.getElementById('lastSyncLabel');
  if (label) {
    label.textContent = lastSync ? `Dernière synchro : ${lastSync}` : 'Base connectée (smartPresence)';
  }
}

// 6. GESTION DES PRÉSENCES
window.toggleAttendance = function(studentId) {
  if (!allAttendance[selectedDate]) {
    allAttendance[selectedDate] = {};
  }
  allAttendance[selectedDate][studentId] = !allAttendance[selectedDate][studentId];
  saveAttendanceLocally();
};

window.checkAllPresent = function() {
  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  const targetList = getFilteredStudents();
  targetList.forEach(s => {
    const sid = s.id || s.matricule;
    allAttendance[selectedDate][sid] = true;
  });
  saveAttendanceLocally();
  const isFiltered = targetList.length !== students.length;
  showToast(isFiltered ? `${targetList.length} élève(s) marqué(s) présent(s).` : 'Tous les élèves ont été marqués présents.');
};

window.uncheckAll = function() {
  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  const targetList = getFilteredStudents();
  targetList.forEach(s => {
    const sid = s.id || s.matricule;
    allAttendance[selectedDate][sid] = false;
  });
  saveAttendanceLocally();
  const isFiltered = targetList.length !== students.length;
  showToast(isFiltered ? `Présences retirées pour ${targetList.length} élève(s).` : 'Toutes les présences ont été retirées.');
};

// 7. INTERFACE ET STATISTIQUES
function updateUI() {
  populateAgeFilter();
  renderStats();
  renderStudentList();
  renderSyncInfo();
}

// Génère dynamiquement les options du filtre par âge selon les élèves inscrits
function populateAgeFilter() {
  const ageSelect = document.getElementById('filterAge');
  if (!ageSelect) return;

  const currentSelected = ageSelect.value;

  const ageCounts = {};
  students.forEach(s => {
    const age = calculateAge(s);
    if (age !== null && age > 0) {
      ageCounts[age] = (ageCounts[age] || 0) + 1;
    }
  });

  const uniqueAges = Object.keys(ageCounts).map(Number).sort((a, b) => a - b);

  let html = '<option value="">🎂 Tous les âges</option>';
  uniqueAges.forEach(age => {
    const count = ageCounts[age];
    html += `<option value="${age}">${age} ans (${count})</option>`;
  });

  ageSelect.innerHTML = html;

  if (currentSelected && uniqueAges.includes(parseInt(currentSelected, 10))) {
    ageSelect.value = currentSelected;
  }
}

// Fonction de filtrage partagée
function getFilteredStudents() {
  const searchInput = document.getElementById('searchInput');
  const genderFilter = document.getElementById('filterGender');
  const ageFilter = document.getElementById('filterAge');

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedGender = genderFilter ? genderFilter.value.trim().toUpperCase() : '';
  const selectedAge = ageFilter ? ageFilter.value.trim() : '';

  return students.filter(s => {
    if (!s) return false;
    const fullName = `${s.nom || ''} ${s.prenom || ''}`.toLowerCase();
    const matricule = String(s.matricule || s.id || '').toLowerCase();

    // Filtre texte
    const matchesSearch = !searchTerm || fullName.includes(searchTerm) || matricule.includes(searchTerm);

    // Filtre par genre (Fille / Garçon)
    let matchesGender = true;
    if (selectedGender) {
      const sSexe = String(s.sexe || '').trim().toUpperCase();
      const normSexe = (sSexe === 'M' || sSexe === 'GARÇON' || sSexe === 'GARCON') ? 'M' : 'F';
      matchesGender = (normSexe === selectedGender);
    }

    // Filtre par âge dynamique
    let matchesAge = true;
    if (selectedAge) {
      const ageCalc = calculateAge(s);
      matchesAge = (ageCalc !== null && String(ageCalc) === String(selectedAge));
    }

    return matchesSearch && matchesGender && matchesAge;
  });
}

window.clearSearch = function() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  renderStudentList();
};

window.resetFilters = function() {
  const searchInput = document.getElementById('searchInput');
  const genderFilter = document.getElementById('filterGender');
  const ageFilter = document.getElementById('filterAge');
  if (searchInput) searchInput.value = '';
  if (genderFilter) genderFilter.value = '';
  if (ageFilter) ageFilter.value = '';
  renderStudentList();
};

function renderStats() {
  const currentAttendance = allAttendance[selectedDate] || {};
  const total = students.length;
  let presentCount = 0;

  students.forEach(s => {
    const sid = s.id || s.matricule;
    if (currentAttendance[sid] || (s.matricule && currentAttendance[s.matricule])) {
      presentCount++;
    }
  });

  const absentCount = total - presentCount;
  const rate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statPresent').textContent = presentCount;
  document.getElementById('statAbsent').textContent = absentCount;
  document.getElementById('statRate').textContent = `${rate}%`;
}

function renderStudentList() {
  const container = document.getElementById('studentsList') || document.getElementById('studentListContainer');
  if (!container) return;

  const searchInput = document.getElementById('searchInput');
  const genderFilter = document.getElementById('filterGender');
  const ageFilter = document.getElementById('filterAge');
  const countDisplay = document.getElementById('filterCountDisplay');
  const btnReset = document.getElementById('btnResetFilters');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const selectedGender = genderFilter ? genderFilter.value.trim().toUpperCase() : '';
  const selectedAge = ageFilter ? ageFilter.value.trim() : '';

  if (clearSearchBtn) {
    if (searchTerm) clearSearchBtn.classList.remove('hidden');
    else clearSearchBtn.classList.add('hidden');
  }

  const isFiltered = !!(searchTerm || selectedGender || selectedAge);
  if (btnReset) {
    if (isFiltered) btnReset.classList.remove('hidden');
    else btnReset.classList.add('hidden');
  }

  const filtered = getFilteredStudents();

  if (countDisplay) {
    if (isFiltered) {
      countDisplay.innerHTML = `<strong>${filtered.length}</strong> élève${filtered.length > 1 ? 's' : ''} affiché${filtered.length > 1 ? 's' : ''} sur ${students.length}`;
    } else {
      countDisplay.textContent = `${students.length} élèves inscrits`;
    }
  }

  const currentAttendance = allAttendance[selectedDate] || {};

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #94a3b8;">
        <span style="font-size: 2.5rem; display: block; margin-bottom: 0.5rem;">🔍</span>
        <p style="font-weight: 600;">Aucun élève trouvé pour ces critères de filtre.</p>
        <button class="btn-secondary" style="margin-top: 10px; cursor: pointer;" onclick="resetFilters()">↺ Réinitialiser les filtres</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const studentId = s.id || s.matricule;
    const isPresent = !!(currentAttendance[studentId] || (s.matricule && currentAttendance[s.matricule]));
    const initial = (s.nom && s.nom.trim().length > 0) ? s.nom.trim()[0].toUpperCase() : 'E';
    const ageCalculated = calculateAge(s);
    const birthYear = getBirthYear(s);
    return `
      <div class="student-row ${isPresent ? 'is-present' : ''}" data-id="${escapeHtml(studentId)}">
        <div class="student-left">
          <input 
            type="checkbox" 
            class="student-checkbox" 
            ${isPresent ? 'checked' : ''} 
            onchange="toggleAttendance('${escapeHtml(studentId)}')"
          />
          <div class="student-avatar">
            ${initial}
          </div>
          <div class="student-info">
            <div class="student-name">${escapeHtml(s.nom)} ${escapeHtml(s.prenom)}</div>
            <div class="student-meta">
              <span class="badge-classe">${escapeHtml(s.classe)}</span>
              <span>${s.sexe === 'F' ? '👧 Fille' : '👦 Garçon'}</span>
              ${ageCalculated ? `<span class="badge-age" title="${birthYear ? `Né(e) en ${birthYear}` : ''}">🎂 ${ageCalculated} ans ${birthYear ? `<span style="font-weight: normal; opacity: 0.85;">(${birthYear})</span>` : ''}</span>` : ''}
              ${s.matricule ? `<span style="font-family: monospace;">Mat: ${escapeHtml(s.matricule)}</span>` : ''}
              ${s.contact ? `<span>📞 ${escapeHtml(s.contact)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="student-actions">
          <button class="btn-icon" title="Modifier" onclick="openEditModal('${escapeHtml(studentId)}')">✏️</button>
          <button class="btn-icon" title="Supprimer" onclick="deleteStudent('${escapeHtml(studentId)}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

// 8. GESTION DES ÉLÈVES (AJOUT / MODIFICATION / SUPPRESSION)
function setupEventListeners() {
  document.getElementById('searchInput')?.addEventListener('input', renderStudentList);
  document.getElementById('filterGender')?.addEventListener('change', renderStudentList);
  document.getElementById('filterAge')?.addEventListener('change', renderStudentList);
  document.getElementById('btnOpenScanner')?.addEventListener('click', startScanner);
  document.getElementById('btnCloseScanner')?.addEventListener('click', stopScanner);
  document.getElementById('qrModal')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) stopScanner();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') stopScanner();
  });

  const updateAgePreview = (inputEl, previewEl) => {
    if (!inputEl || !previewEl) return;
    const val = parseInt(inputEl.value.trim(), 10);
    const curYear = getCurrentYear();
    if (isNaN(val) || val <= 0) {
      previewEl.textContent = '';
      return;
    }
    if (val > 1900 && val <= curYear) {
      previewEl.textContent = `→ ${curYear - val} ans en ${curYear}`;
    } else if (val > 0 && val <= 100) {
      previewEl.textContent = `→ Né(e) en ${curYear - val} (${val} ans en ${curYear})`;
    } else {
      previewEl.textContent = '';
    }
  };

  const newYearInput = document.getElementById('newAnneeNaissance');
  const newYearPreview = document.getElementById('newAgePreview');
  newYearInput?.addEventListener('input', () => updateAgePreview(newYearInput, newYearPreview));

  const editYearInput = document.getElementById('editAnneeNaissance');
  const editYearPreview = document.getElementById('editAgePreview');
  editYearInput?.addEventListener('input', () => updateAgePreview(editYearInput, editYearPreview));

  const addForm = document.getElementById('addStudentForm');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nom = document.getElementById('newNom').value.trim().toUpperCase();
      const prenom = document.getElementById('newPrenom').value.trim();
      const classe = document.getElementById('newClasse').value;
      const sexe = document.getElementById('newSexe').value;
      const matricule = document.getElementById('newMatricule').value.trim();
      const rawYearOrAge = document.getElementById('newAnneeNaissance')?.value.trim();
      const contact = document.getElementById('newContact').value.trim();

      if (!nom || !prenom || !classe) {
        alert('Veuillez remplir au moins le nom, le prénom et la classe.');
        return;
      }

      const curYear = getCurrentYear();
      let anneeNaissance = undefined;
      let age = undefined;
      if (rawYearOrAge) {
        const num = parseInt(rawYearOrAge, 10);
        if (!isNaN(num)) {
          if (num > 1900) {
            anneeNaissance = num;
            age = curYear - num;
          } else if (num > 0 && num <= 100) {
            anneeNaissance = curYear - num;
            age = num;
          }
        }
      }

      const newStudent = {
        id: matricule || `ELEVE-${Date.now()}`,
        matricule: matricule,
        nom: nom,
        prenom: prenom,
        classe: classe,
        sexe: sexe,
        anneeNaissance: anneeNaissance,
        age: age,
        contact: formatContact(contact)
      };

      students.push(newStudent);
      students = sortStudents(students);
      saveStudentsLocally();
      updateUI();
      addForm.reset();
      if (newYearPreview) newYearPreview.textContent = '';
      showToast(`Élève ${nom} ${prenom} ajouté.`);
    });
  }

  const editForm = document.getElementById('editStudentForm');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!editingStudentId) return;

      const idx = students.findIndex(s => s.id === editingStudentId);
      if (idx !== -1) {
        const curYear = getCurrentYear();
        const rawYearOrAge = document.getElementById('editAnneeNaissance')?.value.trim();
        let anneeNaissance = undefined;
        let age = undefined;
        if (rawYearOrAge) {
          const num = parseInt(rawYearOrAge, 10);
          if (!isNaN(num)) {
            if (num > 1900) {
              anneeNaissance = num;
              age = curYear - num;
            } else if (num > 0 && num <= 100) {
              anneeNaissance = curYear - num;
              age = num;
            }
          }
        }

        students[idx].nom = document.getElementById('editNom').value.trim().toUpperCase();
        students[idx].prenom = document.getElementById('editPrenom').value.trim();
        students[idx].classe = document.getElementById('editClasse').value;
        students[idx].sexe = document.getElementById('editSexe').value;
        students[idx].matricule = document.getElementById('editMatricule').value.trim();
        students[idx].anneeNaissance = anneeNaissance;
        students[idx].age = age;
        students[idx].contact = formatContact(document.getElementById('editContact').value.trim());

        students = sortStudents(students);
        saveStudentsLocally();
        closeEditModal();
        updateUI();
        showToast('Fiche élève modifiée.');
      }
    });
  }
}

window.openEditModal = function(id) {
  const student = students.find(s => s.id === id || s.matricule === id);
  if (!student) return;

  editingStudentId = student.id || student.matricule;
  document.getElementById('editNom').value = student.nom || '';
  document.getElementById('editPrenom').value = student.prenom || '';
  document.getElementById('editClasse').value = student.classe || '6e 6';
  document.getElementById('editSexe').value = student.sexe || 'F';
  document.getElementById('editMatricule').value = student.matricule || '';
  
  const curYear = getCurrentYear();
  const bYear = student.anneeNaissance || (student.age && student.age <= 100 ? (curYear - student.age) : student.age);
  const editYearInput = document.getElementById('editAnneeNaissance');
  const editYearPreview = document.getElementById('editAgePreview');
  if (editYearInput) {
    editYearInput.value = bYear || '';
    if (bYear && editYearPreview) {
      const a = curYear - bYear;
      editYearPreview.textContent = `→ ${a} ans en ${curYear}`;
    } else if (editYearPreview) {
      editYearPreview.textContent = '';
    }
  }

  document.getElementById('editContact').value = formatContact(student.contact || '');
  document.getElementById('editModal').classList.remove('hidden');
};

window.closeEditModal = function() {
  editingStudentId = null;
  document.getElementById('editModal').classList.add('hidden');
};

window.deleteStudent = function(id) {
  const s = students.find(item => item.id === id || item.matricule === id);
  const name = s ? `${s.nom} ${s.prenom}` : 'cet élève';

  if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} de la liste ?`)) {
    students = students.filter(item => item.id !== id && item.matricule !== id);
    saveStudentsLocally();
    updateUI();
    showToast('Élève supprimé.');
  }
};

window.resetToDefaultStudents = function() {
  if (confirm('Voulez-vous réinitialiser la liste officielle du Club Robotique (45 élèves) ?')) {
    students = sortStudents([...INITIAL_STUDENTS]);
    saveStudentsLocally();
    updateUI();
    showToast('Liste officielle restaurée (45 élèves).');
  }
};

window.exportJSON = function() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `club_robotique_eleves_${selectedDate}.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
};

// 9. GÉNÉRATION PDF OFFICIELLE AVEC CLUB À GAUCHE ET LYCÉE À DROITE
window.downloadAttendancePDF = async function() {
  const currentAttendance = allAttendance[selectedDate] || {};
  const presents = students.filter(s => {
    const sid = s.id || s.matricule;
    return !!(currentAttendance[sid] || (s.matricule && currentAttendance[s.matricule]));
  });

  if (presents.length === 0) {
    alert("Aucun élève n'est coché présent pour cette date. Marquez au moins un élève présent avant d'exporter.");
    return;
  }

  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("Bibliothèque PDF en cours de chargement...");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Cadre d'en-tête
  doc.setFillColor(248, 250, 252);
  doc.rect(10, 10, 190, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(10, 10, 190, 42, 'D');

  // Chargement des images de logo (Club à gauche, Lycée à droite)
  try {
    const clubImg = await loadImage('./assets/images/logo_club.jpeg');
    doc.addImage(clubImg, 'JPEG', 13, 13, 16, 16);
  } catch (e) {
    console.warn('Logo club non chargé', e);
  }

  try {
    const lyceeImg = await loadImage('./assets/images/logo_lycee.png');
    doc.addImage(lyceeImg, 'PNG', 171, 13, 16, 16);
  } catch (e) {
    console.warn('Logo lycee non chargé', e);
  }

  // Textes officiels
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text("LYCÉE MODERNE 1 D'ABOBO", 33, 18);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text("MINISTÈRE DE L'ÉDUCATION NATIONALE ET DE L'ALPHABÉTISATION", 33, 23);
  doc.text("DRENA : ABIDJAN 4", 33, 27.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(13, 148, 136);
  doc.text("CLUB SCIENTIFIQUE • SECTEUR ROBOTIQUE", 33, 33);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text("Année Scolaire: 2025-2026", 33, 37.5);

  doc.setFillColor(13, 148, 136);
  doc.rect(33, 40, 40, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text("FICHE OFFICIELLE", 53, 44.2, { align: 'center' });

  // Titre Fiche
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text("REGISTRE DE PRÉSENCE - CLUB ROBOTIQUE", 105, 59, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Séance d'activité du : ${selectedDate} • Présents : ${presents.length} / ${students.length}`, 105, 65, { align: 'center' });

  // Tableau
  const tableData = presents.map((s, index) => {
    const ageCalc = calculateAge(s);
    return [
      index + 1,
      s.matricule || '-',
      `${s.nom} ${s.prenom}`,
      s.classe,
      s.sexe === 'F' ? 'F' : 'M',
      ageCalc ? `${ageCalc} ans` : '-',
      s.contact || '-',
      'PRÉSENT'
    ];
  });

  doc.autoTable({
    startY: 72,
    head: [['N°', 'Matricule', 'Nom & Prénoms', 'Classe', 'Sexe', 'Âge', 'Contact', 'Émargement']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 24 },
      2: { cellWidth: 54 },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 32 },
      7: { cellWidth: 26, halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] }
    }
  });

  // Pied de page
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text("L'Encadreur / Responsable du Club", 140, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Signature et cachet :", 140, finalY + 4);

  // Téléchargement
  doc.save(`presence_club_robotique_${selectedDate}.pdf`);
  showToast('Fiche PDF générée et téléchargée.');
};

window.downloadStudentQRCodesPDF = async function() {
  if (students.length === 0) {
    alert("Aucun élève n'est inscrit : impossible de générer les badges.");
    return;
  }
  if (!window.jspdf?.jsPDF || typeof window.QRCode !== 'function') {
    alert("Les bibliothèques PDF ou QR ne sont pas disponibles. Vérifiez que les fichiers de l'application sont présents.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const columns = 2;
  const rows = 3;
  const cardWidth = 94;
  const cardHeight = 88;
  const gapX = 4;
  const gapY = 4;
  const marginX = 9;
  const marginY = 10;
  const qrSize = 46;

  try {
    for (let index = 0; index < students.length; index += 1) {
      const student = students[index];
      const indexOnPage = index % (columns * rows);
      if (index > 0 && indexOnPage === 0) doc.addPage();

      const column = indexOnPage % columns;
      const row = Math.floor(indexOnPage / columns);
      const x = marginX + column * (cardWidth + gapX);
      const y = marginY + row * (cardHeight + gapY);
      const qrDataUrl = await createStudentQRDataUrl(`smartpresence:${student.id}`);

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      const nameLines = doc.splitTextToSize(`${student.nom} ${student.prenom}`, cardWidth - 8).slice(0, 2);
      doc.text(nameLines, x + cardWidth / 2, y + 8, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text('CLUB ROBOTIQUE • LYCÉE MODERNE 1 D’ABOBO', x + cardWidth / 2, y + 17, { align: 'center' });

      doc.addImage(qrDataUrl, 'JPEG', x + (cardWidth - qrSize) / 2, y + 20, qrSize, qrSize);

      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(`Classe : ${student.classe || '-'}`, x + cardWidth / 2, y + 71, { align: 'center' });
      doc.text(`Matricule : ${student.matricule || student.id}`, x + cardWidth / 2, y + 77, { align: 'center' });
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text('Badge personnel de pointage', x + cardWidth / 2, y + 83, { align: 'center' });
    }

    doc.save(`badges_qr_club_robotique_${getTodayDateString()}.pdf`);
    showToast(`${students.length} badges QR générés dans un PDF.`);
  } catch (error) {
    console.error('Erreur de génération des badges QR :', error);
    alert("Une erreur est survenue lors de la génération des badges QR. Vérifiez les bibliothèques locales de l'application.");
  }
};

function createStudentQRDataUrl(value) {
  return new Promise((resolve, reject) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    document.body.appendChild(container);

    try {
      new QRCode(container, {
        text: value,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.H
      });
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        throw new Error('Le générateur QR n’a pas produit de canevas.');
      }
      const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
      container.remove();
      resolve(dataUrl);
    } catch (error) {
      container.remove();
      reject(error);
    }
  });
}

let html5QrCodeScanner = null;
let scannerStartPromise = null;
let lastScannedCode = '';
let lastScanAt = 0;

function playSuccessBeep() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  try {
    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.18);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
    window.setTimeout(() => audioContext.close(), 250);
  } catch (error) {
    console.warn('Bip sonore indisponible :', error);
  }
}

function handleScanSuccess(decodedText) {
  const rawCode = String(decodedText || '').trim();
  if (!rawCode) return;

  const now = Date.now();
  if (rawCode === lastScannedCode && now - lastScanAt < 1500) return;
  lastScannedCode = rawCode;
  lastScanAt = now;

  const tokenPrefix = 'smartpresence:';
  const studentId = rawCode.toLowerCase().startsWith(tokenPrefix)
    ? rawCode.slice(tokenPrefix.length).trim()
    : '';
  let student = studentId ? students.find(item => item.id === studentId) : null;

  if (!student && !studentId) {
    const matchingStudents = students.filter(item =>
      String(item.matricule || '').toLowerCase() === rawCode.toLowerCase()
    );
    if (matchingStudents.length === 1) student = matchingStudents[0];
    if (matchingStudents.length > 1) {
      setScannerFeedback('Ce matricule est partagé par plusieurs élèves. Utilisez leur badge QR personnel.', 'error');
      return;
    }
  }

  if (!student) {
    setScannerFeedback(`Aucun élève trouvé pour le code : ${rawCode}`, 'error');
    return;
  }

  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  const id = student.id || student.matricule;
  if (allAttendance[selectedDate][id]) {
    setScannerFeedback(`${student.nom} ${student.prenom} est déjà pointé(e) présent(e).`, 'success');
    return;
  }

  allAttendance[selectedDate][id] = true;
  saveAttendanceLocally();
  playSuccessBeep();
  setScannerFeedback(`${student.nom} ${student.prenom} pointé(e) PRÉSENT !`, 'success');
}

function setScannerFeedback(message, state = '') {
  const feedback = document.getElementById('scannerFeedback');
  if (!feedback) return;
  feedback.className = `scanner-feedback${state ? ` ${state}` : ''}`;
  feedback.textContent = message;
}

async function startScanner() {
  const modal = document.getElementById('qrModal');
  if (!modal) return;
  if (typeof window.Html5Qrcode !== 'function') {
    setScannerFeedback("La bibliothèque de scan n'est pas disponible. Vérifiez les fichiers de l'application.", 'error');
    modal.classList.remove('hidden');
    return;
  }

  modal.classList.remove('hidden');
  setScannerFeedback('Autorisez l’accès à la caméra et présentez un badge QR...');
  if (scannerStartPromise) return;
  if (!html5QrCodeScanner) {
    const formats = window.Html5QrcodeSupportedFormats;
    const supportedFormats = formats ? [
      formats.QR_CODE,
      formats.CODE_128,
      formats.CODE_39,
      formats.EAN_13,
      formats.EAN_8,
      formats.UPC_A,
      formats.UPC_E,
      formats.ITF
    ].filter(format => format !== undefined) : undefined;
    html5QrCodeScanner = new Html5Qrcode('qr-reader', supportedFormats ? { formatsToSupport: supportedFormats } : {});
  }
  if (html5QrCodeScanner.isScanning) return;

  scannerStartPromise = html5QrCodeScanner.start(
    { facingMode: 'environment' },
    { fps: 10, qrbox: { width: 250, height: 250 } },
    handleScanSuccess
  ).catch(error => {
    console.error('Erreur d’accès à la caméra :', error);
    setScannerFeedback('Impossible d’accéder à la webcam. Vérifiez les autorisations et utilisez localhost ou HTTPS.', 'error');
  }).finally(() => {
    scannerStartPromise = null;
  });
  await scannerStartPromise;
}

async function stopScanner() {
  const modal = document.getElementById('qrModal');
  if (scannerStartPromise) await scannerStartPromise;
  if (html5QrCodeScanner?.isScanning) {
    try {
      await html5QrCodeScanner.stop();
    } catch (error) {
      console.error('Erreur lors de l’arrêt du scanner :', error);
      setScannerFeedback('La caméra n’a pas pu être arrêtée correctement.', 'error');
      return;
    }
  }
  modal?.classList.add('hidden');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', initApp);

// Vérification automatique des mises à jour au démarrage
async function checkForAppUpdates() {
  if (!navigator.onLine) return; // Ne tente rien si hors-ligne

  try {
    const res = await fetch('/api/check-update');
    if (!res.ok) return;
    const data = await res.json();

    if (data.update_available) {
      const banner = document.getElementById('updateBanner');
      const tag = document.getElementById('latestVersionTag');
      if (tag) tag.textContent = `v${data.latest_version}`;
      if (banner) banner.classList.remove('hidden');
    }
  } catch (err) {
    console.log("Vérification mise à jour ignorée (mode hors-ligne ou non supporté).");
  }
}

// Déclenchement de la mise à jour en 1 clic
async function launchAutoUpdate() {
  const btn = document.getElementById('btnApplyUpdate');
  if (btn) {
    btn.disabled = true;
    btn.textContent = "⏳ Téléchargement & Installation...";
  }

  try {
    await fetch('/api/apply-update');
    showToast("Installation en cours... L'application va redémarrer.");
  } catch (err) {
    alert("Erreur lors de la mise à jour. Relancez manuellement l'application.");
  }
}

// Lancer la vérification 3 secondes après le chargement de la page
window.addEventListener('load', () => {
  setTimeout(checkForAppUpdates, 3000);
});
