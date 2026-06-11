import { requireTeacherAuth, saveAssessmentResult } from "./firebaseConfig.js";

const teacherSession = requireTeacherAuth();
if (!teacherSession) {
  throw new Error("Teacher authentication required.");
}

const readingPassages = {
  "grade-1-2": {
    title: "1,2학년 수준 - 아침 산책",
    level: "1,2학년 수준",
    text: "아침에 해가 밝게 떴습니다. 민수는 가방을 메고 집 앞 길을 걸었습니다. 길가에는 작은 꽃이 피어 있었고 새들이 나무 위에서 노래했습니다. 민수는 천천히 걸으며 학교에 갈 준비를 했습니다."
  },
  "grade-3-4": {
    title: "3,4학년 수준 - 마을 도서관",
    level: "3,4학년 수준",
    text: "우리 마을 도서관은 오래된 은행나무 옆에 있습니다. 도서관에 들어가면 조용한 책 냄새가 나고, 창가 자리에는 햇빛이 부드럽게 들어옵니다. 아이들은 자신이 고른 책을 읽으며 새로운 이야기를 만납니다. 사서 선생님은 책을 찾기 어려운 학생들에게 친절하게 방법을 알려 줍니다."
  },
  "grade-5-6": {
    title: "5,6학년 수준 - 숲과 물의 순환",
    level: "5,6학년 수준",
    text: "숲은 비가 내릴 때 많은 물을 머금었다가 천천히 흘려보냅니다. 나무의 뿌리와 낙엽이 쌓인 흙은 스펀지처럼 물을 저장하여 홍수를 줄이는 데 도움을 줍니다. 저장된 물은 시간이 지나며 개울과 강으로 흘러가고, 일부는 다시 증발하여 구름을 만듭니다. 이처럼 숲은 물의 순환을 조절하며 생태계를 건강하게 유지하는 중요한 역할을 합니다."
  }
};

const assessmentDate = document.querySelector("#assessmentDate");
const birthDate = document.querySelector("#birthDate");
const chronologicalAge = document.querySelector("#chronologicalAge");
const passageSelect = document.querySelector("#passageSelect");
const passagePreview = document.querySelector("#passagePreview");
const passageInput = document.querySelector("#readingPassage");
const passageWordCount = document.querySelector("#passageWordCount");
const inputMethodControls = document.querySelectorAll('input[name="inputMethod"]');
const uploadPanel = document.querySelector("#uploadPanel");
const recordPanel = document.querySelector("#recordPanel");
const transcriptFile = document.querySelector("#transcriptFile");
const filePreview = document.querySelector("#filePreview");
const transcriptInput = document.querySelector("#transcriptText");
const readingSeconds = document.querySelector("#readingSeconds");
const analyzeButton = document.querySelector("#analyzeButton");
const saveResultButton = document.querySelector("#saveResultButton");
const readingRate = document.querySelector("#readingRate");
const errorCount = document.querySelector("#errorCount");
const fluencyScore = document.querySelector("#fluencyScore");
const errorTableBody = document.querySelector("#errorTableBody");
const reportText = document.querySelector("#reportText");
const saveMessage = document.querySelector("#saveMessage");
const startRecordingButton = document.querySelector("#startRecordingButton");
const stopRecordingButton = document.querySelector("#stopRecordingButton");
const convertRecordingButton = document.querySelector("#convertRecordingButton");
const recordStatus = document.querySelector("#recordStatus");
const audioPreview = document.querySelector("#audioPreview");

let latestAnalysis = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordedAudioUrl = "";

assessmentDate.valueAsDate = new Date();

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function calculateChronologicalAge(birthDateValue, assessmentDateValue) {
  if (!birthDateValue || !assessmentDateValue) return "";

  const birth = new Date(`${birthDateValue}T00:00:00`);
  const assessment = new Date(`${assessmentDateValue}T00:00:00`);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(assessment.getTime()) || assessment < birth) {
    return "";
  }

  let years = assessment.getFullYear() - birth.getFullYear();
  let months = assessment.getMonth() - birth.getMonth();
  let days = assessment.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const previousMonth = new Date(assessment.getFullYear(), assessment.getMonth(), 0);
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `만 ${years}세 ${months}개월 ${days}일`;
}

function updateChronologicalAge() {
  chronologicalAge.value = calculateChronologicalAge(birthDate.value, assessmentDate.value);
}

function renderPassage() {
  const selectedPassage = readingPassages[passageSelect.value];

  if (!selectedPassage) {
    passageInput.value = "";
    passagePreview.innerHTML = "<p>선택한 문단글 원문이 이곳에 표시됩니다.</p>";
    passageWordCount.textContent = "0";
    return;
  }

  passageInput.value = selectedPassage.text;
  passageWordCount.textContent = countWords(selectedPassage.text);
  passagePreview.innerHTML = `
    <strong>${escapeHtml(selectedPassage.title)}</strong>
    <span>${escapeHtml(selectedPassage.level)}</span>
    <p>${escapeHtml(selectedPassage.text)}</p>
  `;
}

function renderInputMethod() {
  const selectedMethod = document.querySelector('input[name="inputMethod"]:checked')?.value;
  uploadPanel.hidden = selectedMethod !== "upload";
  recordPanel.hidden = selectedMethod !== "record";
}

async function extractTranscriptFromFile(file) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension !== "txt" && file.type !== "text/plain") {
    throw new Error("현재 단계에서는 txt 파일만 업로드할 수 있습니다.");
  }

  return file.text();
}

function renderUploadedFile(file, text) {
  filePreview.innerHTML = `
    <strong>${escapeHtml(file.name)}</strong>
    <span>${text.length.toLocaleString()}자</span>
    <pre>${escapeHtml(text)}</pre>
  `;
}

function calculateReadingRate(wordCount, seconds) {
  if (!wordCount || !seconds) return 0;
  return Math.round((wordCount / seconds) * 60);
}

function compareTokens(passage, transcript) {
  const sourceTokens = passage.trim().split(/\s+/).filter(Boolean);
  const readTokens = transcript.trim().split(/\s+/).filter(Boolean);
  const maxLength = Math.max(sourceTokens.length, readTokens.length);
  const substitutions = [];
  let omissions = 0;
  let insertions = 0;

  for (let index = 0; index < maxLength; index += 1) {
    const source = sourceTokens[index];
    const read = readTokens[index];

    if (source && !read) {
      omissions += 1;
    } else if (!source && read) {
      insertions += 1;
    } else if (source !== read) {
      substitutions.push({ expected: source, actual: read });
    }
  }

  return {
    omissions,
    insertions,
    substitutions: substitutions.length,
    details: substitutions.slice(0, 5)
  };
}

function createReport({ rate, totalErrors, score, errorTypes }) {
  return [
    `읽기 속도는 분당 ${rate}어절로 산출되었습니다.`,
    `전사 텍스트와 제시 문단글의 단순 비교 기준으로 총 ${totalErrors}개의 오류가 추정되었습니다.`,
    `오류 유형은 생략 ${errorTypes.omissions}회, 삽입 ${errorTypes.insertions}회, 대치 ${errorTypes.substitutions}회입니다.`,
    `최종 유창성 점수는 ${score}점입니다.`,
    "이 보고서는 교사용 검토 초안이며, 실제 판정은 검사자의 관찰과 전문적 판단을 함께 반영해야 합니다."
  ].join("\n");
}

function analyzeReadingFluency({ passage, transcript, seconds }) {
  // TODO: Move advanced OpenAI-assisted analysis to Firebase Functions.
  const wordCount = countWords(passage);
  const rate = calculateReadingRate(wordCount, Number(seconds));
  const errorTypes = compareTokens(passage, transcript);
  const totalErrors = errorTypes.omissions + errorTypes.insertions + errorTypes.substitutions;
  const score = Math.max(0, Math.min(100, Math.round(100 - totalErrors * 3 + Math.min(rate, 160) * 0.08)));

  return {
    wordCount,
    readingRate: rate,
    totalErrors,
    score,
    errorTypes,
    report: createReport({ rate, totalErrors, score, errorTypes })
  };
}

function renderAnalysis(analysis) {
  readingRate.textContent = analysis.readingRate;
  errorCount.textContent = analysis.totalErrors;
  fluencyScore.textContent = analysis.score;
  reportText.value = analysis.report;

  const rows = [
    ["생략", "제시 글에 있으나 전사 텍스트에서 누락된 어절", analysis.errorTypes.omissions],
    ["삽입", "제시 글에는 없으나 전사 텍스트에 추가된 어절", analysis.errorTypes.insertions],
    ["대치", "같은 위치에서 서로 다르게 읽힌 어절", analysis.errorTypes.substitutions]
  ];

  errorTableBody.innerHTML = rows
    .map(([type, description, count]) => `
      <tr>
        <td>${type}</td>
        <td>${description}</td>
        <td>${count}</td>
      </tr>
    `)
    .join("");
}

function getFormData() {
  const selectedPassage = readingPassages[passageSelect.value];

  return {
    studentName: document.querySelector("#studentName").value.trim(),
    birthDate: birthDate.value,
    chronologicalAge: chronologicalAge.value,
    assessmentDate: assessmentDate.value,
    teacherName: teacherSession?.displayName,
    teacherEmail: teacherSession?.email,
    passageId: passageSelect.value,
    passageTitle: selectedPassage?.title || "",
    passage: passageInput.value.trim(),
    transcript: transcriptInput.value.trim(),
    seconds: Number(readingSeconds.value),
    memo: document.querySelector("#teacherMemo").value.trim()
  };
}

async function requestTranscriptionFromServer() {
  // TODO: Send the in-memory audio blob to Firebase Functions and return text.
  // Do not persist the original recording file in Firebase Storage or Firestore.
  if (!recordedChunks.length) return "";
  return "";
}

birthDate.addEventListener("change", updateChronologicalAge);
assessmentDate.addEventListener("change", updateChronologicalAge);
passageSelect.addEventListener("change", renderPassage);
inputMethodControls.forEach((control) => {
  control.addEventListener("change", renderInputMethod);
});

transcriptFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  try {
    const transcript = await extractTranscriptFromFile(file);
    transcriptInput.value = transcript;
    renderUploadedFile(file, transcript);
    saveMessage.textContent = "txt 전사파일을 불러왔습니다. 전사 텍스트를 확인하고 수정할 수 있습니다.";
  } catch (error) {
    transcriptFile.value = "";
    filePreview.innerHTML = `<strong>업로드 오류</strong><p>${escapeHtml(error.message)}</p>`;
  }
});

startRecordingButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      recordedAudioUrl = "";
    }

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      const audioBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      recordedAudioUrl = URL.createObjectURL(audioBlob);
      audioPreview.src = recordedAudioUrl;
      audioPreview.hidden = false;
      convertRecordingButton.disabled = false;
      recordStatus.textContent = "녹음 완료 - 미리듣기가 준비되었습니다. 원본 파일은 Firebase에 저장하지 않습니다.";
    });

    mediaRecorder.start();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    convertRecordingButton.disabled = true;
    audioPreview.hidden = true;
    recordStatus.textContent = "녹음 중...";
  } catch {
    recordStatus.textContent = "브라우저 마이크 권한을 확인해 주세요.";
  }
});

stopRecordingButton.addEventListener("click", () => {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    startRecordingButton.disabled = false;
    stopRecordingButton.disabled = true;
  }
});

convertRecordingButton.addEventListener("click", async () => {
  const convertedText = await requestTranscriptionFromServer();
  transcriptInput.value = convertedText || "[텍스트 변환 준비됨] Firebase Functions 연동 후 녹음 전사 결과가 이곳에 표시됩니다.";
  recordStatus.textContent = "녹음 → 텍스트 변환 함수 구조가 준비되었습니다.";
});

analyzeButton.addEventListener("click", () => {
  const formData = getFormData();

  if (!formData.passage || !formData.transcript || !formData.seconds) {
    saveMessage.textContent = "문단글 선택, 전사 텍스트, 읽기 시간을 먼저 입력해 주세요.";
    return;
  }

  latestAnalysis = analyzeReadingFluency(formData);
  renderAnalysis(latestAnalysis);
  saveMessage.textContent = "분석 결과가 생성되었습니다. 필요하면 보고서 내용을 수정한 뒤 저장하세요.";
});

saveResultButton.addEventListener("click", async () => {
  const formData = getFormData();

  if (!latestAnalysis) {
    saveMessage.textContent = "저장 전 분석하기를 먼저 실행해 주세요.";
    return;
  }

  const savedResult = await saveAssessmentResult({
    ...formData,
    transcriptText: formData.transcript,
    readingRate: latestAnalysis.readingRate,
    errorAnalysis: latestAnalysis.errorTypes,
    totalErrors: latestAnalysis.totalErrors,
    finalScore: latestAnalysis.score,
    report: reportText.value.trim()
  });

  saveMessage.textContent = `${savedResult.studentName} 학생의 분석 결과가 저장되었습니다.`;
});

renderInputMethod();
renderPassage();
updateChronologicalAge();
