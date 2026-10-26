/**
 * CLUB ROBOTIQUE - LYCÉE MODERNE 1 D'ABOBO
 * Application pure JavaScript (Vanilla JS - 100% autonome et connectée)
 * Base de données : Google Sheets ("smartPresence")
 */

// =====================================================================
// 1. CONFIGURATION & ÉTAT GLOBAL DE L'APPLICATION
// =====================================================================

// URL officielle du Web Service Google Apps Script déployé
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyiENiDA1uu4sbSV8dTHFCmMoWl4rv9RARnmrKlFClnoE88W_rra6pJH5LOyBZtCAf0jw/exec';

// Badges officiels des professeurs encadreurs (Sécurité d'ouverture / fermeture)
const TEACHERS = [
  { id: "PROF-01", code: "smartpresence:prof:01", nom: "M. KABLAN", role: "Encadreur Principal" },
  { id: "PROF-02", code: "smartpresence:prof:02", nom: "ENCADREUR ATELIER", role: "Responsable Robotique" }
];

let students = [];
let allAttendance = {}; // { "YYYY-MM-DD": { [studentId]: boolean } }
let selectedDate = getTodayDateString();
let isOnline = navigator.onLine;
let editingStudentId = null;

// Gestion de session sécurisée
let isSessionOpen = false;
let sessionOpenedBy = null;
let sessionOpenedAt = null;

// File d'attente WhatsApp automatique
let whatsappQueue = [];
let currentQueueIndex = 0;

// Scanner QR Code & Webcam
let html5QrCodeScanner = null;
let scannerStartPromise = null;
let lastScannedCode = '';
let lastScanAt = 0;


// =====================================================================
// 2. UTILITAIRES DE DATE, ÂGE ET FORMATAGE
// =====================================================================

function getTodayDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localToday = new Date(today.getTime() - offset * 60 * 1000);
  return localToday.toISOString().split('T')[0];
}

function getCurrentYear() {
  return new Date().getFullYear();
}

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
  
  if (digits.length === 9 && ['1', '5', '7', '2'].includes(digits[0])) {
    return '0' + digits;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits;
  }
  if (digits.startsWith('225') && digits.length === 13) {
    return '+' + digits;
  }
  return phone;
}


// =====================================================================
// 3. SIGNAUX SONORES & SYNTHÈSE VOCALE ROBOTIQUE
// =====================================================================

function speakVoice(text) {
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Synthèse vocale indisponible :", e);
  }
}

function playSuccessBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
    setTimeout(() => audioCtx.close(), 250);
  } catch (e) {}
}

function playAlertBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
    setTimeout(() => audioCtx.close(), 400);
  } catch (e) {}
}

function playTeacherBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    [587.33, 880].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.12);
      osc.stop(audioCtx.currentTime + i * 0.12 + 0.12);
    });
    setTimeout(() => audioCtx.close(), 500);
  } catch (e) {}
}


// =====================================================================
// 4. TRI, FUSION ET GESTION DES IDENTIFIANTS
// =====================================================================

function sortStudents(list) {
  const curYear = getCurrentYear();
  const sorted = [...list]
    .filter(Boolean)
    .map(s => {
      const bYear = getBirthYear(s);
      const calcAge = bYear ? (curYear - bYear) : (s.age || '');
      return {
        ...s,
        idCarte: s.idCarte ? String(s.idCarte).trim() : '',
        anneeNaissance: bYear || s.anneeNaissance || '',
        age: calcAge || '',
        contact: formatContact(s.contact)
      };
    })
    .sort((a, b) => {
      if (a.idCarte && b.idCarte) {
        const numA = parseInt(a.idCarte, 10);
        const numB = parseInt(b.idCarte, 10);
        if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      }
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

    const idCarte = student.idCarte || String(index + 1).padStart(4, '0');
    return { ...student, id, idCarte };
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
    const idCarte = String(student.idCarte || '').trim();
    const matricule = String(student.matricule || '').trim().toLowerCase();
    const name = `${student.nom || ''} ${student.prenom || ''}`
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

    if (idCarte) return `carte:${idCarte}`;
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


// =====================================================================
// 5. INITIALISATION & PERSISTANCE LOCALE (OFFLINE-FIRST)
// =====================================================================

function initApp() {
  try {
    const storedStudents = localStorage.getItem('club_robotique_students');
    if (storedStudents) {
      const parsed = JSON.parse(storedStudents);
      if (Array.isArray(parsed) && parsed.length > 0) {
        students = sortStudents(parsed);
      }
    }

    const storedAttendance = localStorage.getItem('club_robotique_attendance');
    if (storedAttendance) {
      allAttendance = JSON.parse(storedAttendance);
    }
  } catch (e) {
    console.error('Erreur chargement local :', e);
    students = [];
  }

  const dateInput = document.getElementById('datePicker');
  if (dateInput) {
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', (e) => {
      selectedDate = e.target.value;
      updateUI();
    });
  }

  window.addEventListener('online', () => {
    isOnline = true;
    updateNetworkStatus();
    showToast('🌐 Connexion rétablie. Synchronisation avec Google Sheets...');
    const banner = document.getElementById('reconnectBanner');
    if (banner) banner.classList.remove('hidden');
    fetchFromGoogleSheet(true);
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    updateNetworkStatus();
    showToast('⚠️ Vous êtes hors-ligne. Les pointages restent enregistrés en local.');
  });

  setupEventListeners();
  updateNetworkStatus();
  updateSessionUI();
  updateUI();
  renderSyncInfo();

  if (navigator.onLine) {
    const isFirstRun = students.length === 0;
    fetchFromGoogleSheet(!isFirstRun);
  } else if (students.length === 0) {
    showToast('⚠️ Base locale vide. Connectez-vous à Internet pour charger la liste.');
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

function updateSessionUI() {
  const badge = document.getElementById('sessionBadge');
  if (!badge) return;

  if (isSessionOpen) {
    badge.className = 'status-badge session-open';
    badge.innerHTML = `<span class="dot-pulse-session"></span> Séance Ouverte (${sessionOpenedBy ? sessionOpenedBy.nom : 'Prof'})`;
  } else {
    badge.className = 'status-badge session-closed';
    badge.innerHTML = `<span class="dot-pulse-session"></span> Séance Fermée (En attente du prof)`;
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


// =====================================================================
// 6. SYNCHRONISATION BI-DIRECTIONNELLE AVEC GOOGLE SHEETS
// =====================================================================

window.fetchFromGoogleSheet = async function(silent = false) {
  if (!navigator.onLine) {
    if (!silent) alert("⚠️ Vous êtes actuellement hors-ligne. Impossible de contacter Google Sheets pour le moment.");
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

    if (!response.ok) throw new Error(`Erreur réseau HTTP : ${response.status}`);
    const data = await response.json();

    if (data.status === 'success') {
      if (Array.isArray(data.students) && data.students.length > 0) {
        students = mergeStudents(students, data.students);
        saveStudentsLocally();
      }

      if (data.attendances && typeof data.attendances === 'object') {
        allAttendance = { ...allAttendance, ...data.attendances };
        localStorage.setItem('club_robotique_attendance', JSON.stringify(allAttendance));
      }

      const nowFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('club_robotique_last_sync', `Aujourd'hui à ${nowFormatted}`);
      renderSyncInfo();
      updateUI();

      if (!silent) showToast(`✅ Base Google Sheets synchronisée (${students.length} élèves inscrits).`);
    } else if (!silent) {
      showToast(`⚠️ Réponse Google Sheets: ${data.message || 'Action non reconnue'}`);
    }
  } catch (err) {
    console.warn('Lecture Google Sheets :', err);
    if (!silent) showToast('Connexion à Google Sheets impossible pour le moment.');
  } finally {
    if (btnFetch && !silent) {
      btnFetch.disabled = false;
      btnFetch.innerHTML = originalFetchText;
    }
  }
};

window.syncToGoogleSheet = async function() {
  if (!navigator.onLine) {
    alert("⚠️ Vous êtes actuellement HORS-LIGNE.\n\nToutes vos modifications sont sauvegardées en local sur cet ordinateur.\nConnectez-vous à Internet pour enregistrer dans Google Sheets.");
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

    await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const nowFormatted = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('club_robotique_last_sync', `Aujourd'hui à ${nowFormatted}`);
    renderSyncInfo();

    showToast('✅ Données enregistrées dans Google Sheets avec succès !');
    const banner = document.getElementById('reconnectBanner');
    if (banner) banner.classList.add('hidden');

  } catch (err) {
    console.error('Erreur synchro :', err);
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


// =====================================================================
// 7. GESTION DES PRÉSENCES & ACTIONS MANUELLES
// =====================================================================

window.toggleAttendance = function(studentId) {
  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  allAttendance[selectedDate][studentId] = !allAttendance[selectedDate][studentId];
  saveAttendanceLocally();
};

window.checkAllPresent = function() {
  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  const targetList = getFilteredStudents();
  targetList.forEach(s => {
    const sid = s.id || s.matricule || s.idCarte;
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
    const sid = s.id || s.matricule || s.idCarte;
    allAttendance[selectedDate][sid] = false;
  });
  saveAttendanceLocally();
  const isFiltered = targetList.length !== students.length;
  showToast(isFiltered ? `Présences retirées pour ${targetList.length} élève(s).` : 'Toutes les présences ont été retirées.');
};


// =====================================================================
// 8. INTERFACE, FILTRES & STATISTIQUES
// =====================================================================

function updateUI() {
  populateAgeFilter();
  renderStats();
  renderStudentList();
  renderSyncInfo();
}

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
    html += `<option value="${age}">${age} ans (${ageCounts[age]})</option>`;
  });

  ageSelect.innerHTML = html;
  if (currentSelected && uniqueAges.includes(parseInt(currentSelected, 10))) {
    ageSelect.value = currentSelected;
  }
}

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
    const matricule = String(s.matricule || '').toLowerCase();
    const idCarte = String(s.idCarte || '').toLowerCase();

    const matchesSearch = !searchTerm || fullName.includes(searchTerm) || matricule.includes(searchTerm) || idCarte.includes(searchTerm);

    let matchesGender = true;
    if (selectedGender) {
      const sSexe = String(s.sexe || '').trim().toUpperCase();
      const normSexe = (sSexe === 'M' || sSexe === 'GARÇON' || sSexe === 'GARCON') ? 'M' : 'F';
      matchesGender = (normSexe === selectedGender);
    }

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
    const sid = s.id || s.matricule || s.idCarte;
    if (currentAttendance[sid] || (s.matricule && currentAttendance[s.matricule]) || (s.idCarte && currentAttendance[s.idCarte])) {
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
    const studentId = s.id || s.matricule || s.idCarte;
    const isPresent = !!(currentAttendance[studentId] || (s.matricule && currentAttendance[s.matricule]) || (s.idCarte && currentAttendance[s.idCarte]));
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
            <div class="student-name">
              ${escapeHtml(s.nom)} ${escapeHtml(s.prenom)}
            </div>
            <div class="student-meta">
              <span class="badge-carte-tag">N° ${escapeHtml(s.idCarte || '-')}</span>
              <span class="badge-classe">${escapeHtml(s.classe)}</span>
              <span>${s.sexe === 'F' ? '👧 Fille' : '👦 Garçon'}</span>
              ${ageCalculated ? `<span class="badge-age" title="${birthYear ? `Né(e) en ${birthYear}` : ''}">🎂 ${ageCalculated} ans</span>` : ''}
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


// =====================================================================
// 9. FORMULAIRES AJOUT, ÉDITION & GESTION DES ÉLÈVES
// =====================================================================

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
    if (event.key === 'Escape') {
      stopScanner();
      closeEditModal();
      closeSummaryModal();
      closeWhatsAppAutoModal();
    }
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
      const classe = document.getElementById('newClasse').value.trim();
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

      const nextCardNum = String(students.length + 1).padStart(4, '0');
      const newStudent = {
        id: matricule || `ELEVE-${Date.now()}`,
        idCarte: nextCardNum,
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
      showToast(`Élève ${nom} ${prenom} ajouté(e) avec la carte N° ${nextCardNum}.`);
    });
  }

  const editForm = document.getElementById('editStudentForm');
  if (editForm) {
    editForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!editingStudentId) return;

      const idx = students.findIndex(s => s.id === editingStudentId || s.matricule === editingStudentId || s.idCarte === editingStudentId);
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
        students[idx].classe = document.getElementById('editClasse').value.trim();
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
  const student = students.find(s => s.id === id || s.matricule === id || s.idCarte === id);
  if (!student) return;

  editingStudentId = student.id || student.matricule || student.idCarte;
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
  const s = students.find(item => item.id === id || item.matricule === id || item.idCarte === id);
  const name = s ? `${s.nom} ${s.prenom}` : 'cet élève';

  if (confirm(`Êtes-vous sûr de vouloir supprimer ${name} de la liste ?`)) {
    students = students.filter(item => item.id !== id && item.matricule !== id && item.idCarte !== id);
    saveStudentsLocally();
    updateUI();
    showToast('Élève supprimé.');
  }
};

window.resetToDefaultStudents = function() {
  if (confirm('Recharger la liste officielle des élèves depuis Google Sheets ?')) {
    localStorage.removeItem('club_robotique_students');
    students = [];
    updateUI();
    fetchFromGoogleSheet(false);
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


// =====================================================================
// 10. SCANNER WEBCAM & WORKFLOW SÉCURISÉ (PROF -> ÉLÈVES -> PROF)
// =====================================================================

function setScannerFeedback(message, state = '') {
  const feedback = document.getElementById('scannerFeedback');
  if (!feedback) return;
  feedback.className = `scanner-feedback${state ? ` ${state}` : ''}`;
  feedback.textContent = message;
}

function handleScanSuccess(decodedText) {
  const rawCode = String(decodedText || '').trim();
  if (!rawCode) return;

  const now = Date.now();
  if (rawCode === lastScannedCode && now - lastScanAt < 1800) return;
  lastScannedCode = rawCode;
  lastScanAt = now;

  // --- A. GESTION DU BADGE PROFESSEUR ---
  const teacher = TEACHERS.find(t => 
    t.code.toLowerCase() === rawCode.toLowerCase() || 
    t.id.toLowerCase() === rawCode.toLowerCase()
  );

  if (teacher) {
    playTeacherBeep();

    if (!isSessionOpen) {
      // 🟢 OUVERTURE DE LA SÉANCE
      isSessionOpen = true;
      sessionOpenedBy = teacher;
      sessionOpenedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      updateSessionUI();
      speakVoice(`Séance officiellement ouverte. Bienvenue ${teacher.nom}.`);
      setScannerFeedback(`🟢 Séance OUVERTE par ${teacher.nom} à ${sessionOpenedAt}. Les élèves peuvent pointer !`, 'success');
      showToast(`Séance ouverte par ${teacher.nom}`);
    } else {
      // 🛑 CLÔTURE DE LA SÉANCE
      isSessionOpen = false;
      const closedAt = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      updateSessionUI();
      speakVoice("Séance clôturée. Bilan disponible.");
      setScannerFeedback(`🛑 Séance CLÔTURÉE par ${teacher.nom} à ${closedAt}.`, 'success');
      
      stopScanner();
      openSummaryModal(); // Ouvre la fenêtre du bilan officiel

      // Déclenche l'assistant d'envoi automatique WhatsApp aux parents d'absents après 1.5s
      setTimeout(() => {
        triggerAutoWhatsAppAlerts();
      }, 1500);
    }
    return;
  }

  // --- B. SI LA SÉANCE N'EST PAS OUVERTE, BLOCAGE ---
  if (!isSessionOpen) {
    playAlertBeep();
    speakVoice("Attention, la séance n'est pas encore ouverte.");
    setScannerFeedback("⚠️ Séance NON ouverte. L'encadreur doit d'abord scanner son badge prof !", 'error');
    return;
  }

  // --- C. TRAITEMENT DU POINTAGE ÉLÈVE ---
  const tokenPrefix = 'smartpresence:';
  const cleanCode = rawCode.toLowerCase().startsWith(tokenPrefix)
    ? rawCode.slice(tokenPrefix.length).trim()
    : rawCode;

  const student = students.find(s => 
    String(s.idCarte || '').toLowerCase() === cleanCode.toLowerCase() ||
    String(s.matricule || '').toLowerCase() === cleanCode.toLowerCase() ||
    String(s.id || '').toLowerCase() === cleanCode.toLowerCase()
  );

  if (!student) {
    playAlertBeep();
    speakVoice("Badge inconnu.");
    setScannerFeedback(`❌ Badge inconnu : ${cleanCode}`, 'error');
    return;
  }

  if (!allAttendance[selectedDate]) allAttendance[selectedDate] = {};
  const studentKey = student.id || student.matricule || student.idCarte;

  if (allAttendance[selectedDate][studentKey]) {
    speakVoice(`${student.prenom} est déjà enregistré.`);
    setScannerFeedback(`ℹ️ ${student.nom} ${student.prenom} (N° ${student.idCarte || '-'}) est DÉJÀ présent(e).`, 'success');
    return;
  }

  allAttendance[selectedDate][studentKey] = true;
  saveAttendanceLocally();
  playSuccessBeep();
  speakVoice(`Présent ! Bienvenue ${student.prenom}.`);
  setScannerFeedback(`✅ [N° ${student.idCarte || '-'}] ${student.nom} ${student.prenom} marqué(e) PRÉSENT !`, 'success');
}

async function startScanner() {
  const modal = document.getElementById('qrModal');
  if (!modal) return;

  if (typeof window.Html5Qrcode !== 'function') {
    setScannerFeedback("La bibliothèque de scan n'est pas disponible. Vérifiez vos fichiers.", 'error');
    modal.classList.remove('hidden');
    return;
  }

  modal.classList.remove('hidden');
  setScannerFeedback(
    isSessionOpen 
      ? 'Séance active : Présentez les badges élèves devant la caméra...' 
      : 'Séance fermée : L’encadreur doit d’abord scanner son badge prof pour ouvrir.'
  );

  if (scannerStartPromise) return;

  if (!html5QrCodeScanner) {
    html5QrCodeScanner = new Html5Qrcode('qr-reader', {
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true // 🚀 Accélération matérielle native
      }
    });
  }

  if (html5QrCodeScanner.isScanning) return;

  // Zone de détection souple (70% de la fenêtre de la caméra)
  const qrboxFunction = function(viewfinderWidth, viewfinderHeight) {
    const minEdgePercentage = 0.70;
    const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
    return {
      width: qrboxSize,
      height: qrboxSize
    };
  };

  scannerStartPromise = html5QrCodeScanner.start(
    { facingMode: 'environment' },
    { 
      fps: 15, // Plus fluide
      qrbox: qrboxFunction,
      aspectRatio: 1.0
    },
    handleScanSuccess
  ).catch(error => {
    console.error('Erreur caméra :', error);
    setScannerFeedback('Impossible d’accéder à la webcam. Vérifiez vos autorisations.', 'error');
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
      console.error('Arrêt caméra :', error);
      return;
    }
  }
  modal?.classList.add('hidden');
}


// =====================================================================
// 11. BILAN DE SÉANCE : LISTE DES PRÉSENTS & ABSENTS
// =====================================================================

function openSummaryModal() {
  const modal = document.getElementById('sessionSummaryModal');
  if (!modal) return;

  const currentAtt = allAttendance[selectedDate] || {};
  const presents = [];
  const absents = [];

  students.forEach((s, idx) => {
    const sid = s.id || s.matricule || s.idCarte;
    const badgeNum = s.idCarte || String(idx + 1).padStart(4, '0');
    const item = { ...s, badgeNum };

    if (currentAtt[sid] || (s.matricule && currentAtt[s.matricule]) || (s.idCarte && currentAtt[s.idCarte])) {
      presents.push(item);
    } else {
      absents.push(item);
    }
  });

  const total = students.length;
  const rate = total > 0 ? Math.round((presents.length / total) * 100) : 0;

  document.getElementById('sumPresentsCount').textContent = presents.length;
  document.getElementById('sumAbsentsCount').textContent = absents.length;
  document.getElementById('sumRate').textContent = `${rate}%`;
  document.getElementById('countPresCol').textContent = presents.length;
  document.getElementById('countAbsCol').textContent = absents.length;
  document.getElementById('summarySubtitle').textContent = `Séance du ${selectedDate} • Encadreur : ${sessionOpenedBy ? sessionOpenedBy.nom : 'M. KABLAN'}`;

  // Tableau des présents
  const presTbody = document.getElementById('presentsTableBody');
  presTbody.innerHTML = presents.map(p => `
    <tr>
      <td><span class="badge-carte-tag">N° ${escapeHtml(p.badgeNum)}</span></td>
      <td><strong>${escapeHtml(p.nom)}</strong> ${escapeHtml(p.prenom)}</td>
      <td><span class="badge-classe">${escapeHtml(p.classe || '-')}</span></td>
    </tr>
  `).join('') || '<tr><td colspan="3" style="text-align:center;color:#94a3b8;padding:12px;">Aucun élève présent</td></tr>';

  // Tableau des absents avec bouton WhatsApp individuel direct
  const absTbody = document.getElementById('absentsTableBody');
  absTbody.innerHTML = absents.map(a => `
    <tr>
      <td><span class="badge-carte-tag">N° ${escapeHtml(a.badgeNum)}</span></td>
      <td><strong>${escapeHtml(a.nom)}</strong> ${escapeHtml(a.prenom)}</td>
      <td><span class="badge-classe">${escapeHtml(a.classe || '-')}</span></td>
      <td>
        ${a.contact ? `
          <button class="btn-wa" onclick="openWhatsAppParent('${escapeHtml(a.nom)}', '${escapeHtml(a.prenom)}', '${escapeHtml(a.classe)}', '${escapeHtml(a.contact)}')">
            💬 WhatsApp
          </button>
        ` : '<span style="color:#94a3b8;font-size:0.75rem;">Pas de contact</span>'}
      </td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align:center;color:#15803d;font-weight:bold;padding:12px;">Félicitations, aucun absent !</td></tr>';

  modal.classList.remove('hidden');
}

function closeSummaryModal() {
  document.getElementById('sessionSummaryModal')?.classList.add('hidden');
}


// =====================================================================
// 12. MODULE WHATSAPP : PILOTE AUTOMATIQUE & NOTIFICATIONS PARENTS
// =====================================================================

function cleanPhoneNumberCI(phoneStr) {
  if (!phoneStr) return null;
  const first = phoneStr.split('/')[0].trim();
  const digits = first.replace(/\D/g, '');

  if (digits.length === 10) return `225${digits}`;
  if (digits.length === 9) return `2250${digits}`;
  if (digits.startsWith('225') && digits.length === 13) return digits;
  return null;
}

function openWhatsAppParent(studentNom, studentPrenom, studentClasse, parentPhone) {
  const cleanPhone = cleanPhoneNumberCI(parentPhone);
  if (!cleanPhone) {
    alert(`Numéro de téléphone invalide pour ${studentNom} ${studentPrenom}`);
    return;
  }

  const message = encodeURIComponent(
    `Bonjour M./Mme,\n\n` +
    `Le Club Robotique du Lycée Moderne 1 d'Abobo vous informe que votre enfant ${studentNom} ${studentPrenom} (${studentClasse}) était absent(e) à la séance d'atelier du ${selectedDate}.\n\n` +
    `Merci de bien vouloir justifier son absence.\n` +
    `Cordialement,\nL'Encadreur du Club Robotique.`
  );

  window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
}

function triggerAutoWhatsAppAlerts() {
  const currentAtt = allAttendance[selectedDate] || {};

  whatsappQueue = students.filter(s => {
    const isPresent = !!(currentAtt[s.id] || currentAtt[s.matricule] || currentAtt[s.idCarte]);
    const hasPhone = !!cleanPhoneNumberCI(s.contact);
    return !isPresent && hasPhone;
  });

  if (whatsappQueue.length === 0) {
    showToast("ℹ️ Aucun absent à notifier sur WhatsApp (ou aucun numéro renseigné).");
    return;
  }

  currentQueueIndex = 0;
  showWhatsAppAutoModal();
}

function showWhatsAppAutoModal() {
  let modal = document.getElementById('waAutoModal');

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'waAutoModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 480px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📲</div>
        <h3 style="margin-bottom: 0.5rem; color: #0f172a;">Alertes WhatsApp Automatiques</h3>
        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 1rem;">
          La séance est clôturée. L'assistant va ouvrir WhatsApp pour chaque parent d'absent.
        </p>

        <div style="background: #f1f5f9; padding: 12px; border-radius: 12px; margin-bottom: 1.25rem;">
          <div style="font-size: 0.75rem; font-weight: 700; color: #0284c7; text-transform: uppercase;" id="waQueueStep">
            ÉLÈVE 1 SUR 5
          </div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 4px 0;" id="waStudentName">
            NOM PRÉNOM
          </div>
          <div style="font-size: 0.8rem; color: #64748b;" id="waStudentMeta">
            Classe : 6e 6 • Parent : 0707607293
          </div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button id="btnSendCurrentWa" class="btn-wa-group" style="flex: 2;" onclick="sendCurrentQueueItem()">
            💬 Ouvrir WhatsApp (<span id="btnWaIndex">1</span>/<span id="btnWaTotal">5</span>)
          </button>
          <button class="btn-secondary" style="flex: 1;" onclick="skipCurrentQueueItem()">
            Ignorer
          </button>
          <button class="btn-secondary" style="background:#fee2e2; color:#b91c1c; border-color:#fca5a5;" onclick="closeWhatsAppAutoModal()">
            Arrêter
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  updateWhatsAppAutoUI();
  modal.classList.remove('hidden');
}

function updateWhatsAppAutoUI() {
  if (currentQueueIndex >= whatsappQueue.length) {
    closeWhatsAppAutoModal();
    showToast("✅ Tous les parents d'absents ont été notifiés sur WhatsApp !");
    speakVoice("Tous les parents d'absents ont été notifiés.");
    return;
  }

  const s = whatsappQueue[currentQueueIndex];
  document.getElementById('waQueueStep').textContent = `ÉLÈVE ${currentQueueIndex + 1} SUR ${whatsappQueue.length}`;
  document.getElementById('waStudentName').textContent = `${s.nom} ${s.prenom}`;
  document.getElementById('waStudentMeta').textContent = `Classe : ${s.classe || '-'} • Contact : ${s.contact}`;
  document.getElementById('btnWaIndex').textContent = currentQueueIndex + 1;
  document.getElementById('btnWaTotal').textContent = whatsappQueue.length;
}

function sendCurrentQueueItem() {
  if (currentQueueIndex >= whatsappQueue.length) return;
  const s = whatsappQueue[currentQueueIndex];
  openWhatsAppParent(s.nom, s.prenom, s.classe, s.contact);
  currentQueueIndex++;
  updateWhatsAppAutoUI();
}

function skipCurrentQueueItem() {
  currentQueueIndex++;
  updateWhatsAppAutoUI();
}

function closeWhatsAppAutoModal() {
  document.getElementById('waAutoModal')?.classList.add('hidden');
}

function shareRecapToWhatsAppGroup() {
  const currentAtt = allAttendance[selectedDate] || {};
  const presents = students.filter(s => currentAtt[s.id] || currentAtt[s.matricule] || currentAtt[s.idCarte]);
  const absents = students.filter(s => !currentAtt[s.id] && !currentAtt[s.matricule] && !currentAtt[s.idCarte]);
  const total = students.length;
  const rate = total > 0 ? Math.round((presents.length / total) * 100) : 0;

  let text = `🤖 *CLUB ROBOTIQUE — LYCÉE MODERNE 1 D'ABOBO*\n`;
  text += `📅 *Compte-rendu de séance :* ${selectedDate}\n`;
  text += `────────────────────\n`;
  text += `📊 *Présents :* ${presents.length} / ${total} (${rate}%)\n`;
  text += `❌ *Absents :* ${absents.length}\n\n`;

  if (absents.length > 0) {
    text += `*Liste des élèves absents :*\n`;
    absents.forEach((a, i) => {
      text += `${i + 1}. ${a.nom} ${a.prenom} (${a.classe})\n`;
    });
  } else {
    text += `🎉 Félicitations : 100% de présence aujourd'hui !\n`;
  }

  text += `\n_L'Encadreur du Club Robotique — DRENA Abidjan 4_`;

  navigator.clipboard.writeText(text).then(() => {
    showToast("📋 Texte copié ! Ouverture de WhatsApp...");
    window.open("https://web.whatsapp.com", "_blank");
  }).catch(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  });
}


// =====================================================================
// 13. GÉNÉRATION PDF 1 : FICHE OFFICIELLE D'ÉMARGEMENT DU JOUR (A4)
// =====================================================================

window.downloadAttendancePDF = async function() {
  const currentAttendance = allAttendance[selectedDate] || {};
  const presents = students.filter(s => {
    const sid = s.id || s.matricule || s.idCarte;
    return !!(currentAttendance[sid] || (s.matricule && currentAttendance[s.matricule]) || (s.idCarte && currentAttendance[s.idCarte]));
  });

  if (presents.length === 0) {
    alert("Aucun élève n'est coché présent pour cette date. Marquez au moins un élève présent avant d'exporter.");
    return;
  }

  if (!window.jspdf?.jsPDF) {
    alert("Bibliothèque PDF en cours de chargement...");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  doc.setFillColor(248, 250, 252);
  doc.rect(10, 10, 190, 42, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(10, 10, 190, 42, 'D');

  try {
    const clubImg = await loadImage('./assets/images/logo_club.jpeg');
    doc.addImage(clubImg, 'JPEG', 13, 13, 16, 16);
  } catch (e) {}

  try {
    const lyceeImg = await loadImage('./assets/images/logo_lycee.png');
    doc.addImage(lyceeImg, 'PNG', 171, 13, 16, 16);
  } catch (e) {}

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

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text("REGISTRE DE PRÉSENCE - CLUB ROBOTIQUE", 105, 59, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Séance du : ${selectedDate} • Présents : ${presents.length} / ${students.length}`, 105, 65, { align: 'center' });

  const tableData = presents.map((s, index) => {
    const ageCalc = calculateAge(s);
    return [
      index + 1,
      s.idCarte || '-',
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
    head: [['N°', 'N° Carte', 'Matricule', 'Nom & Prénoms', 'Classe', 'Sexe', 'Âge', 'Contact', 'Statut']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 7, halign: 'center' },
      1: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 22 },
      3: { cellWidth: 48 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 14, halign: 'center' },
      7: { cellWidth: 32 },
      8: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] }
    }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text("L'Encadreur / Responsable du Club", 140, finalY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Signature et cachet :", 140, finalY + 4);

  doc.save(`presence_club_robotique_${selectedDate}.pdf`);
  showToast('Fiche PDF générée et téléchargée.');
};


// =====================================================================
// 14. GÉNÉRATION PDF 2 : 100 BADGES ÉLÈVES (5 PAR LIGNE) + BADGES PROFS
// =====================================================================

window.downloadStudentQRCodesPDF = async function() {
  if (!window.jspdf?.jsPDF || typeof window.QRCode !== 'function') {
    alert("Les bibliothèques PDF ou QR Code sont en cours de chargement...");
    return;
  }

  showToast("Génération des 100 badges élèves + badges professeurs...");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const COLS = 5;      // 5 BADGES PAR LIGNE
  const ROWS = 4;      // 4 LIGNES PAR PAGE = 20 BADGES PAR PAGE
  const BADGES_PER_PAGE = COLS * ROWS;

  const cardWidth = 54;    // 54mm de large
  const cardHeight = 44;   // 44mm de haut
  const gapX = 3.5;
  const gapY = 3.5;
  const marginX = 7;
  const marginY = 8;
  const qrSize = 22;       // 22mm x 22mm

  const badgeList = [];
  for (let i = 0; i < 100; i++) {
    const existing = students[i];
    if (existing) {
      const badgeId = existing.idCarte || String(i + 1).padStart(4, '0');
      badgeList.push({
        badgeNum: badgeId,
        nom: existing.nom,
        prenom: existing.prenom,
        classe: existing.classe || '-',
        qrValue: `smartpresence:${badgeId}`
      });
    } else {
      const emptyNum = String(i + 1).padStart(4, '0');
      badgeList.push({
        badgeNum: emptyNum,
        nom: 'CARTE MEMBRE',
        prenom: 'Élève à assigner',
        classe: 'Club Robotique',
        qrValue: `smartpresence:${emptyNum}`
      });
    }
  }

  // --- PAGES 1 À 5 : LES 100 BADGES ÉLÈVES (20 par page) ---
  for (let i = 0; i < badgeList.length; i++) {
    const b = badgeList[i];
    const indexOnPage = i % BADGES_PER_PAGE;
    if (i > 0 && indexOnPage === 0) doc.addPage('a4', 'landscape');

    const col = indexOnPage % COLS;
    const row = Math.floor(indexOnPage / COLS);
    const x = marginX + col * (cardWidth + gapX);
    const y = marginY + row * (cardHeight + gapY);

    const qrDataUrl = await createStudentQRDataUrl(b.qrValue);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2);

    doc.setFillColor(15, 23, 42);
    doc.rect(x, y, cardWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    doc.text("CLUB ROBOTIQUE • LM 1 ABOBO", x + cardWidth / 2, y + 4.2, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(2, 132, 199);
    doc.text(`N° ${b.badgeNum}`, x + cardWidth / 2, y + 10.5, { align: 'center' });

    doc.addImage(qrDataUrl, 'JPEG', x + (cardWidth - qrSize) / 2, y + 11.5, qrSize, qrSize);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const fullName = `${b.nom} ${b.prenom}`;
    const truncatedName = fullName.length > 22 ? fullName.slice(0, 20) + "..." : fullName;
    doc.text(truncatedName, x + cardWidth / 2, y + 37.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Classe : ${b.classe}`, x + cardWidth / 2, y + 41.5, { align: 'center' });
  }

  // --- PAGE 6 : LES BADGES PROFESSEURS ---
  doc.addPage('a4', 'landscape');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text("BADGES PROFESSEURS — OUVERTURE & CLÔTURE DE SÉANCE", 148.5, 18, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text("Le professeur scanne son badge pour ouvrir la séance, puis le re-scanne pour la clôturer.", 148.5, 25, { align: 'center' });

  for (let tIdx = 0; tIdx < TEACHERS.length; tIdx++) {
    const prof = TEACHERS[tIdx];
    const profCardWidth = 75;
    const profCardHeight = 65;
    const profQrSize = 34;
    const px = 55 + tIdx * (profCardWidth + 25);
    const py = 45;

    const profQrUrl = await createStudentQRDataUrl(prof.code);

    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.8);
    doc.roundedRect(px, py, profCardWidth, profCardHeight, 3, 3);

    doc.setFillColor(217, 119, 6);
    doc.rect(px, py, profCardWidth, 9, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("PASS ENCADREUR OFFICIEL", px + profCardWidth / 2, py + 6, { align: 'center' });

    doc.addImage(profQrUrl, 'JPEG', px + (profCardWidth - profQrSize) / 2, py + 12, profQrSize, profQrSize);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(prof.nom, px + profCardWidth / 2, py + 52, { align: 'center' });

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(prof.role, px + profCardWidth / 2, py + 57, { align: 'center' });

    doc.setFontSize(6.5);
    doc.setTextColor(217, 119, 6);
    doc.text("Scanner pour Ouvrir / Fermer la séance", px + profCardWidth / 2, py + 61.5, { align: 'center' });
  }

  doc.save(`planche_100_badges_eleves_et_profs_${selectedDate}.pdf`);
  showToast("✅ Planche de 100 badges élèves + badges profs téléchargée !");
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
      if (!canvas) throw new Error('Le générateur QR n’a pas produit de canevas.');
      const dataUrl = canvas.toDataURL('image/jpeg', 0.96);
      container.remove();
      resolve(dataUrl);
    } catch (error) {
      container.remove();
      reject(error);
    }
  });
}


// =====================================================================
// 15. AUTO-UPDATER GITHUB RELEASES
// =====================================================================

async function checkForAppUpdates() {
  if (!navigator.onLine) return;

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
    console.log("Vérification mise à jour ignorée (hors-ligne ou non supporté).");
  }
}

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


// =====================================================================
// 16. FONCTIONS GLOBALES D'INTERFACE & DÉMARRAGE
// =====================================================================

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

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', initApp);

// Contrôle automatique des mises à jour 3 secondes après ouverture
window.addEventListener('load', () => {
  setTimeout(checkForAppUpdates, 3000);
});