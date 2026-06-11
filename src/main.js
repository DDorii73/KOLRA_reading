import { requireTeacherAuth, saveAssessmentResult } from "./firebaseConfig.js";

const teacherSession = requireTeacherAuth();
if (!teacherSession) {
  throw new Error("Teacher authentication required.");
}

const assessmentDate = document.querySelector("#assessmentDate");
const passageInput = document.querySelector("#readingPassage");
const transcriptInput = document.querySelector("#transcriptText");
const transcriptFile = document.querySelector("#transcriptFile");
const passageWordCount = document.querySelector("#passageWordCount");
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

let latestAnalysis = null;
let mediaRecorder = null;
let recordedChunks = [];

assessmentDate.valueAsDate = new Date();

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
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

async function requestTranscriptionFromServer() {
  // TODO: Send the in-memory audio blob to Firebase Functions and return text.
  // Do not persist the original recording file in Firebase Storage or Firestore.
  if (!recordedChunks.length) return "";
  return "";
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
  return {
    studentName: document.querySelector("#studentName").value.trim(),
    studentGrade: document.querySelector("#studentGrade").value,
    assessmentDate: assessmentDate.value,
    teacherName: document.querySelector("#teacherName").value.trim() || teacherSession?.displayName,
    passage: passageInput.value.trim(),
    transcript: transcriptInput.value.trim(),
    seconds: Number(readingSeconds.value),
    memo: document.querySelector("#teacherMemo").value.trim()
  };
}

passageInput.addEventListener("input", () => {
  passageWordCount.textContent = countWords(passageInput.value);
});

transcriptFile.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;

  transcriptInput.value = await file.text();
});

analyzeButton.addEventListener("click", () => {
  const formData = getFormData();

  if (!formData.passage || !formData.transcript || !formData.seconds) {
    saveMessage.textContent = "제시 문단글, 전사 텍스트, 읽기 시간을 먼저 입력해 주세요.";
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

startRecordingButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      recordStatus.textContent = "녹음 완료 - 원본 파일은 저장하지 않습니다. 전사는 서버 함수 연동 예정입니다.";
      convertRecordingButton.disabled = false;
    });

    mediaRecorder.start();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    convertRecordingButton.disabled = true;
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
  await requestTranscriptionFromServer();
  recordStatus.textContent = "텍스트 변환 함수 구조가 준비되었습니다. 실제 변환은 Firebase Functions 연동 후 실행됩니다.";
});
