/**
 * sound-player.js
 * Charge tous les sons depuis Firestore, les joue bout à bout en boucle.
 * - 4 secondes de silence entre chaque enregistrement
 * - 10 secondes de silence avant de reboucler au début
 * Écoute les nouveaux ajouts en temps réel (onSnapshot).
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDsHlm5r4cUFVy1IkRMl8yzxXn1aXsZOEg",
  authDomain: "oups-festival.firebaseapp.com",
  projectId: "oups-festival",
  storageBucket: "oups-festival.firebasestorage.app",
  messagingSenderId: "231958475030",
  appId: "1:231958475030:web:2655c7b1f7a030407ba037"
};

const GAP_BETWEEN = 4000;   // ms entre chaque son
const GAP_LOOP    = 10000;  // ms avant de reboucler au début

// Évite la double initialisation si viewer.js a déjà init Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Playlist ──────────────────────────────────────────────────────────────────
let playlist   = [];
let currentIdx = 0;
let audio      = new Audio();
let gapTimer   = null;

audio.crossOrigin = 'anonymous';

function playNext() {
  if (playlist.length === 0) return;

  currentIdx = currentIdx % playlist.length;
  const track = playlist[currentIdx];

  audio.src = track.audioData;
  audio.load();

  audio.play().catch(err => {
    console.warn('Autoplay bloqué, attente interaction…', err);
    document.addEventListener('click',      resumeOnInteraction, { once: true });
    document.addEventListener('touchstart', resumeOnInteraction, { once: true });
    document.addEventListener('keydown',    resumeOnInteraction, { once: true });
  });
}

function scheduleNext() {
  const isLast  = currentIdx === playlist.length - 1;
  const delay   = isLast ? GAP_LOOP : GAP_BETWEEN;

  clearTimeout(gapTimer);
  gapTimer = setTimeout(() => {
    currentIdx = (currentIdx + 1) % playlist.length;
    playNext();
  }, delay);
}

function resumeOnInteraction() {
  if (playlist.length > 0) audio.play().catch(() => {});
}

audio.addEventListener('ended', scheduleNext);

audio.addEventListener('error', () => {
  console.warn('Erreur audio sur', playlist[currentIdx]?.filename, '— passage au suivant');
  clearTimeout(gapTimer);
  gapTimer = setTimeout(() => {
    currentIdx = (currentIdx + 1) % playlist.length;
    playNext();
  }, GAP_BETWEEN);
});

// ── Firestore realtime ─────────────────────────────────────────────────────────
export function initSoundPlayer() {
  const q = query(collection(db, 'sounds'), orderBy('createdAt', 'asc'));

  onSnapshot(q, snapshot => {
    const wasEmpty = playlist.length === 0;

    playlist = snapshot.docs
      .map(doc => doc.data())
      .filter(d => d.audioData);

    if (wasEmpty && playlist.length > 0) {
      currentIdx = 0;
      playNext();
    }
  }, err => {
    console.error('Erreur Firestore sounds :', err);
  });
}
