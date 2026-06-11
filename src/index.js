import {
  clearTeacherSession,
  signInWithGoogleForTeacher,
  subscribeToTeacherAuth
} from "./firebaseConfig.js";

const loginButton = document.querySelector("#googleLoginButton");
const logoutButton = document.querySelector("#logoutButton");
const authMessage = document.querySelector("#authMessage");
const teacherProfile = document.querySelector("#teacherProfile");
const teacherActions = document.querySelector("#teacherActions");

function renderAuthState(session) {
  const isSignedIn = Boolean(session?.isTeacher);

  loginButton.hidden = isSignedIn;
  logoutButton.hidden = !isSignedIn;
  teacherProfile.hidden = !isSignedIn;
  teacherActions.hidden = !isSignedIn;

  authMessage.textContent = isSignedIn
    ? `${session.displayName} 선생님, 환영합니다.`
    : "교사 로그인이 필요합니다.";
  teacherProfile.textContent = isSignedIn
    ? `로그인 계정: ${session.displayName} / ${session.email || "이메일 정보 없음"}`
    : "";
}

loginButton.addEventListener("click", async () => {
  try {
    loginButton.disabled = true;
    authMessage.textContent = "Google 로그인 창을 확인해 주세요.";
    const session = await signInWithGoogleForTeacher();
    renderAuthState(session);
  } catch (error) {
    authMessage.textContent = "Google 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    console.error(error);
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  try {
    logoutButton.disabled = true;
    await clearTeacherSession();
    renderAuthState(null);
  } catch (error) {
    authMessage.textContent = "로그아웃에 실패했습니다. 잠시 후 다시 시도해 주세요.";
    console.error(error);
  } finally {
    logoutButton.disabled = false;
  }
});

subscribeToTeacherAuth(renderAuthState);
