import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut
} from "firebase/auth";

// Firebase 설정값은 Vite 환경변수(VITE_FIREBASE_*)에서만 불러옵니다.
// OpenAI API Key는 프론트엔드 코드 또는 Vite 클라이언트 환경변수에 두지 않습니다.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const AUTH_STORAGE_KEY = "readingFluencyTeacherAuth";
const RESULTS_STORAGE_KEY = "readingFluencyResultsDraft";

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

function createTeacherSession(user) {
  if (!user) return null;

  return {
    isTeacher: true,
    uid: user.uid,
    displayName: user.displayName || "교사",
    email: user.email,
    photoURL: user.photoURL,
    signedInAt: new Date().toISOString()
  };
}

export function getTeacherSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setTeacherSession(session) {
  if (session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }
}

export async function clearTeacherSession() {
  await signOut(auth);
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function requireTeacherAuth() {
  const session = getTeacherSession();

  if (!session?.isTeacher) {
    window.location.href = "index.html";
    return null;
  }

  return session;
}

export async function signInWithGoogleForTeacher() {
  const { user } = await signInWithPopup(auth, googleProvider);
  const session = createTeacherSession(user);
  setTeacherSession(session);
  return session;
}

export function subscribeToTeacherAuth(callback) {
  return onAuthStateChanged(auth, (user) => {
    const session = createTeacherSession(user);

    if (session) {
      setTeacherSession(session);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }

    callback(session);
  });
}

export async function saveAssessmentResult(result) {
  // TODO: Replace with Firestore write. Raw recording files must not be saved.
  const currentResults = await fetchAssessmentResults();
  const savedResult = {
    ...result,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString()
  };

  localStorage.setItem(
    RESULTS_STORAGE_KEY,
    JSON.stringify([savedResult, ...currentResults])
  );

  return savedResult;
}

export async function fetchAssessmentResults() {
  // TODO: Replace with Firestore query scoped to the signed-in teacher.
  try {
    return JSON.parse(localStorage.getItem(RESULTS_STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
