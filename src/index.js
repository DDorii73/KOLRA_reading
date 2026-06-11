import {
  clearTeacherSession,
  getTeacherSession,
  signInWithGoogleForTeacher
} from "./firebaseConfig.js";

const loginButton = document.querySelector("#googleLoginButton");
const logoutButton = document.querySelector("#logoutButton");
const authMessage = document.querySelector("#authMessage");
const protectedLinks = document.querySelectorAll("[data-auth-link]");

function renderAuthState() {
  const session = getTeacherSession();
  const isSignedIn = Boolean(session?.isTeacher);

  loginButton.hidden = isSignedIn;
  logoutButton.hidden = !isSignedIn;
  authMessage.textContent = isSignedIn
    ? `${session.displayName}님, 검사 페이지와 모니터링 페이지를 사용할 수 있습니다.`
    : "교사용 Google 로그인 후 검사 페이지와 모니터링 페이지를 사용할 수 있습니다.";

  protectedLinks.forEach((link) => {
    link.classList.toggle("disabled-link", !isSignedIn);
    link.setAttribute("aria-disabled", String(!isSignedIn));
  });
}

loginButton.addEventListener("click", async () => {
  await signInWithGoogleForTeacher();
  renderAuthState();
});

logoutButton.addEventListener("click", () => {
  clearTeacherSession();
  renderAuthState();
});

protectedLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!getTeacherSession()?.isTeacher) {
      event.preventDefault();
      authMessage.textContent = "먼저 교사용 Google 로그인을 진행해 주세요.";
    }
  });
});

renderAuthState();
