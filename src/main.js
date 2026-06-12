import { requireTeacherAuth } from "./firebaseConfig.js";

const teacherSession = requireTeacherAuth();
if (!teacherSession) {
  throw new Error("Teacher authentication required.");
}

const readingPassages = {
  "grade-1-2": {
    title: "1,2학년 수준 [김밥만들기]",
    level: "1,2학년 수준",
    text: `김밥만들기
김밥을 만들기 위해 필요한 재료를 준비한다. 먼저 김을 깔고 밥을 잘 펴준다. 그리고 단무지와 살짝 볶은 오이와 당근을 길게 썰어 얹어준다. 햄도 볶아서 올리고 계란은 넓게 부친다. 계란이 익으면 칼로 썰어 얹어준다. 발로 터지지 않도록 잘 말아 손바닥으로 꼭꼭 눌러준다. 그리고 김밥을 도마 위에 올려놓고 칼로 한입크기로 썬다.`
  },
  "grade-3-4": {
    title: "3,4학년 수준 [산과 바다]",
    level: "3,4학년 수준",
    text: `산과 바다
여름철이 되면 사람들은 여행을 가는데 어떤 사람들은 바다를 선호하고 어떤 사람들은 산을 선호한다. 산과 바다는 유사한 점과 차이점이 있어 사람들은 어디로 가야할지 고민한다.
산과 바다의 유사한 점은 고된 일을 잊고 편안하게 쉴 수 있다는 것이다.
그리고 산은 올라갈 때 미끄러지지 않게 조심해야 하고 바다는 물에 빠지지 않게 조심해야 한다는 주의점이 있는 것도 유사하다.
산과 바다는 다른 점도 가지고 있는데 첫째, 산은 정상에 도착하기까지 올라가는 것이 힘들다. 그러나 바다는 바다를 바라보며 천천히 걸을 수 있어 힘이 들지 않는다. 그리고 산은 나무를 볼 수 있고 바다는 푸른 바다를 볼 수 있다는 것이 다르다. 또 산에서는 산새들과 곤충들을 볼 수 있고 바다에서는 갈매기와 바다생물들을 볼 수 있다는 것이 다르다.`
  },
  "grade-5-6": {
    title: "5,6학년 수준 [의생활]",
    level: "5,6학년 수준",
    text: `의생활
우리들은 항상 의상을 입고 지내며 어떤 의상을 선택할지에 대해서도 중요하게 생각합니다. 이러한 의상은 나름대로의 특성들이 있으며 국가, 직업, 쓰임새에 따라서 분류해볼 수 있습니다.
먼저 국가로 분류해보자면 사리, 한복, 기모노, 치파오 등의 나라를 대표하는 전통의상이 있습니다. 우리나라의 전통의상인 한복은 품이 큰 바지와 저고리, 치마로 된 색이 고운 의 상이며 저고리는 옷고름을 이용하여 여미는 것이 특징입니다. 인도의 전통의상인 사리의 특 징은 온몸을 덮을 만큼 큰 천으로 몸을 가리는 것이며, 일본의 전통의상인 기모노는 나누어 지지 않은 큰 옷감으로 온몸을 감싼 후 허리를 매는 것이 특징입니다. 그리고 중국의 전통 의상 치파오는 화려한 장식이 수놓아진 치마에 상의는 목까지 올라와 단추로 잠그는 것이 특징입니다.
다음으로 직업으로 분류해보자면 요리사, 소방관, 경찰관 등의 사람들이 근무할 때 입는 의 상으로 나눌 수 있습니다. 요리사는 요리를 할 때 몸에 붙어 있는 이물질이 요리에 들어가는 것을 방지하기 위해 가운을 입습니다. 소방관은 위험한 상황에 노출되어 있으며 화염 속 에서 불이 몸에 붙는 것을 막기 위해 소방관복을 입어 몸을 화상으로부터 보호합니다. 마지 막으로 경찰관은 사람들에게 범죄나 불법적인 일에 대한 경각심을 일으키기 위해 경찰복을 입어서 특별한 경찰관의 신분을 나타냅니다.
마지막으로 쓰임새로 분류해보면 수영복, 우비, 웨딩드레스 등으로 나눌 수 있습니다. 우리 는 수영을 할 때 물 속에서 저항을 줄이고 앞으로 나아가는 데 방해를 받지 않으려고 수영복 을 입습니다. 비가 오는 날에는 우산을 써도 바람을 타고 들이치는 비를 막고 우산을 들지 않음으로써 보다 자유롭게 활동하기 위해 우비를 입습니다. 그리고 결혼을 할 때에는 순결 하고 고귀함을 나타내기 위해 순백색의 웨딩드레스를 입습니다.
위에서 우리는 의상을 나라, 직업, 쓰임새에 따라 분류해 보았습니다. 이렇게 의생활은 우 리의 생활과 밀접하게 연결되어 있어 뗄 수 없으며 우리는 상황에 맞는 의상을 선택해서 입어야 합니다.`
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
const tempSaveReportButton = document.querySelector("#tempSaveReportButton");
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

function countSyllables(text) {
  return (text.match(/[가-힣A-Za-z0-9]/g) || []).length;
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

function calculateReadingRate(totalSyllables, errorSyllables, seconds) {
  if (!totalSyllables || !seconds) return 0;
  const correctSyllables = Math.max(totalSyllables - errorSyllables, 0);
  return Number(((correctSyllables / seconds) * 10).toFixed(1));
}

function compareTokens(passage, transcript) {
  const sourceTokens = passage.trim().split(/\s+/).filter(Boolean);
  const readTokens = transcript.trim().split(/\s+/).filter(Boolean);
  const maxLength = Math.max(sourceTokens.length, readTokens.length);
  const substitutions = [];
  const omissionExamples = [];
  const insertionExamples = [];
  let omissions = 0;
  let insertions = 0;

  for (let index = 0; index < maxLength; index += 1) {
    const source = sourceTokens[index];
    const read = readTokens[index];

    if (source && !read) {
      omissions += 1;
      omissionExamples.push(source);
    } else if (!source && read) {
      insertions += 1;
      insertionExamples.push(read);
    } else if (source !== read) {
      substitutions.push({ expected: source, actual: read });
    }
  }

  return {
    omissions,
    insertions,
    substitutions: substitutions.length,
    examples: {
      omission: omissionExamples.slice(0, 3),
      insertion: insertionExamples.slice(0, 3),
      substitution: substitutions.slice(0, 3)
    },
    errorWords: {
      omission: omissionExamples,
      insertion: insertionExamples,
      substitution: substitutions.map(({ expected, actual }) => `${expected}→${actual}`)
    },
    errorSyllables:
      omissionExamples.reduce((sum, word) => sum + countSyllables(word), 0) +
      insertionExamples.reduce((sum, word) => sum + countSyllables(word), 0) +
      substitutions.reduce((sum, { expected }) => sum + countSyllables(expected), 0)
  };
}

function getMainErrorType(errorTypes) {
  const entries = [
    ["생략", errorTypes.omissions],
    ["삽입", errorTypes.insertions],
    ["대치", errorTypes.substitutions]
  ];
  const [type, count] = entries.sort((a, b) => b[1] - a[1])[0];
  return count > 0 ? `${type} 오류` : "두드러진 오류 없음";
}

function formatErrorWords(type, errorTypes) {
  if (type === "생략") {
    return errorTypes.errorWords.omission.length ? errorTypes.errorWords.omission.join(", ") : "해당 없음";
  }

  if (type === "삽입") {
    return errorTypes.errorWords.insertion.length ? errorTypes.errorWords.insertion.join(", ") : "해당 없음";
  }

  return errorTypes.errorWords.substitution.length ? errorTypes.errorWords.substitution.join(", ") : "해당 없음";
}

function createErrorRows(errorTypes) {
  return [
    {
      type: "생략",
      count: errorTypes.omissions,
      errorWords: formatErrorWords("생략", errorTypes)
    },
    {
      type: "삽입",
      count: errorTypes.insertions,
      errorWords: formatErrorWords("삽입", errorTypes)
    },
    {
      type: "대치",
      count: errorTypes.substitutions,
      errorWords: formatErrorWords("대치", errorTypes)
    }
  ];
}

function createReport({ formData, totalSyllables, errorSyllables, rate, errorTypes }) {
  const mainErrorType = getMainErrorType(errorTypes);
  const studentName = formData.studentName || "학생 A";
  const passageTitle = formData.passageTitle || "선택한 지문";
  const readingSecondsText = formData.seconds || "미입력";

  return [
    `다음은 ${passageTitle} 지문을 활용한 문단글 읽기 유창성 검사 결과 해석 예시이다.`,
    `${studentName}는 ${passageTitle} 지문을 읽는 과정에서 전체 문단 음절 수 ${totalSyllables}음절 중 ${errorSyllables}음절에서 오류를 보였으며, 전체 소요시간은 ${readingSecondsText}초였다. 이에 따라 10초당 정확하게 읽은 음절 수는 [(${totalSyllables}-${errorSyllables})/${readingSecondsText}]×10으로 산출되며, 약 ${rate}음절로 계산된다. ${studentName}의 오류 유형을 분석한 결과, ${mainErrorType}이 주요하게 나타났으며 생략 ${errorTypes.omissions}회, 삽입 ${errorTypes.insertions}회, 대치 ${errorTypes.substitutions}회가 나타났다.`
  ].join("\n ");
}

function analyzeReadingFluency(formData) {
  // TODO: Move advanced OpenAI-assisted analysis to Firebase Functions.
  const wordCount = countWords(formData.passage);
  const totalSyllables = countSyllables(formData.passage);
  const errorTypes = compareTokens(formData.passage, formData.transcript);
  const totalErrors = errorTypes.omissions + errorTypes.insertions + errorTypes.substitutions;
  const errorSyllables = errorTypes.errorSyllables;
  const rate = calculateReadingRate(totalSyllables, errorSyllables, Number(formData.seconds));
  const score = rate;
  const errorRows = createErrorRows(errorTypes);

  return {
    wordCount,
    totalSyllables,
    errorSyllables,
    readingRate: rate,
    totalErrors,
    score,
    errorTypes,
    errorRows,
    report: createReport({ formData, totalSyllables, errorSyllables, rate, errorTypes })
  };
}

function renderAnalysis(analysis) {
  readingRate.textContent = analysis.readingRate;
  errorCount.textContent = analysis.totalErrors;
  fluencyScore.textContent = analysis.score;
  reportText.value = analysis.report;

  errorTableBody.innerHTML = analysis.errorRows
    .map((row) => `
      <tr>
        <td><span class="badge">${escapeHtml(row.type)}</span></td>
        <td>${escapeHtml(row.count)}</td>
        <td>${escapeHtml(row.errorWords)}</td>
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

function buildAnalysisResultData(formData, analysis) {
  return {
    teacherUid: teacherSession?.uid || "",
    teacherEmail: teacherSession?.email || "",
    studentName: formData.studentName,
    testDate: formData.assessmentDate,
    passageTitle: formData.passageTitle,
    transcriptText: formData.transcript,
    readingSpeed: analysis.readingRate,
    errorAnalysis: analysis.errorRows,
    finalScore: analysis.score,
    reportText: reportText.value.trim(),
    createdAt: new Date().toISOString()
  };
}

function saveAnalysisResult() {
  const formData = getFormData();

  if (!latestAnalysis) {
    saveMessage.textContent = "저장 전 분석하기를 먼저 실행해 주세요.";
    return;
  }

  const analysisResultData = buildAnalysisResultData(formData, latestAnalysis);
  console.log("Firestore 저장 예정 데이터:", analysisResultData);
  saveMessage.textContent = "저장 예정 데이터를 콘솔에서 확인할 수 있습니다.";
}

function tempSaveReport() {
  console.log("학생별 임시저장 보고서:", {
    studentName: getFormData().studentName,
    reportText: reportText.value.trim(),
    savedAt: new Date().toISOString()
  });
  saveMessage.textContent = "학생별 보고서 임시저장 데이터를 콘솔에서 확인할 수 있습니다.";
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

saveResultButton.addEventListener("click", saveAnalysisResult);
tempSaveReportButton.addEventListener("click", tempSaveReport);

renderInputMethod();
renderPassage();
updateChronologicalAge();
