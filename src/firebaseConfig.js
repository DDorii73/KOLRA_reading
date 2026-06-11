// Firebase SDK 연결 정보는 실제 프로젝트 생성 후 환경에 맞게 채웁니다.
// OpenAI API Key는 이 파일 또는 프론트엔드 코드에 두지 않습니다.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};

const AUTH_STORAGE_KEY = "readingFluencyTeacherAuth";
const RESULTS_STORAGE_KEY = "readingFluencyResultsDraft";

export function getTeacherSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function setTeacherSession(session) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearTeacherSession() {
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
  // TODO: Replace with Firebase Auth Google provider.
  const mockSession = {
    isTeacher: true,
    displayName: "교사 사용자",
    email: "teacher@example.com",
    signedInAt: new Date().toISOString()
  };

  setTeacherSession(mockSession);
  return mockSession;
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
