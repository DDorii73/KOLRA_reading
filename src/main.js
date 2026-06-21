import { clearTeacherSession, requireTeacherAuth, saveAssessmentResult } from "./firebaseConfig.js";
import ragReference from "../rag.md?raw";

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
const audioUploadPanel = document.querySelector("#audioUploadPanel");
const transcriptFile = document.querySelector("#transcriptFile");
const filePreview = document.querySelector("#filePreview");
const audioFile = document.querySelector("#audioFile");
const convertUploadedAudioButton = document.querySelector("#convertUploadedAudioButton");
const audioUploadStatus = document.querySelector("#audioUploadStatus");
const uploadedAudioPreview = document.querySelector("#uploadedAudioPreview");
const transcriptInput = document.querySelector("#transcriptText");
const readingSeconds = document.querySelector("#readingSeconds");
const analyzeButton = document.querySelector("#analyzeButton");
const saveResultButton = document.querySelector("#saveResultButton");
const readingRate = document.querySelector("#readingRate");
const errorCount = document.querySelector("#errorCount");
const fluencyScore = document.querySelector("#fluencyScore");
const analysisSummary = document.querySelector("#analysisSummary");
const errorTableBody = document.querySelector("#errorTableBody");
const reportText = document.querySelector("#reportText");
const saveMessage = document.querySelector("#saveMessage");
const tempSaveReportButton = document.querySelector("#tempSaveReportButton");
const pageLogoutButton = document.querySelector("#pageLogoutButton");
const startRecordingButton = document.querySelector("#startRecordingButton");
const stopRecordingButton = document.querySelector("#stopRecordingButton");
const convertRecordingButton = document.querySelector("#convertRecordingButton");
const recordStatus = document.querySelector("#recordStatus");
const audioMeter = document.querySelector("#audioMeter");
const audioPreview = document.querySelector("#audioPreview");

let latestAnalysis = null;
let mediaRecorder = null;
let recordedChunks = [];
let recordedAudioUrl = "";
let audioContext = null;
let analyserNode = null;
let meterAnimationId = null;
let speechRecognition = null;
let liveTranscript = "";
let uploadedAudioFile = null;
let uploadedAudioUrl = "";

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
  audioUploadPanel.hidden = selectedMethod !== "audio-upload";
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

const fillerWords = new Set(["음", "어", "음음", "어어", "그러니까"]);
const pronunciationAllowances = {
  김밥을: ["김빠블", "김빱을"],
  김밥: ["김빱", "김빰"],
  필요한: ["피료한"],
  김을: ["기믈"],
  밥을: ["바블"],
  볶은: ["보끈", "뽀끈"],
  당근을: ["당그늘"],
  길게: ["길케"],
  썰어: ["써러"],
  얹어준다: ["언저준다"],
  볶아서: ["보까서", "뽀까서"],
  계란은: ["계라는"],
  넓게: ["널께"],
  익으면: ["이그면"],
  않도록: ["안토록"],
  않게: ["안케"],
  조심해야: ["조시매야"],
  손바닥으로: ["손바다그로"],
  놓고: ["노코"],
  올려놓고: ["올려노코"],
  한입크기로: ["한닙크기로"],
  사람들은: ["사람드른"],
  선호하고: ["서노하고"],
  선호한다: ["서노한다"],
  유사한: ["유사한"],
  점은: ["저믄"],
  일을: ["이를"],
  있고: ["이꼬"],
  있다: ["이따"]
};

function normalizeToken(token) {
  return String(token ?? "")
    .replace(/[.,!?;:()[\]{}"“”'‘’·…]/g, "")
    .replace(/[~\-—–]+/g, "")
    .replace(/[ㄱ-ㅎㅏ-ㅣ]/g, "")
    .replace(/\s+/g, "")
    .trim();
}

function tokenizeText(text) {
  return text
    .replace(/([^\s])아니/g, "$1 아니")
    .replace(/아니([^\s])/g, "아니 $1")
    .replace(/^[\d]+[-.)]?\s*/gm, "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function isPronunciationAllowed(sourceToken, readToken) {
  const source = normalizeToken(sourceToken);
  const read = normalizeToken(readToken);
  if (!source || !read) return false;
  if (source === read) return true;
  return (pronunciationAllowances[source] || []).some((allowed) => normalizeToken(allowed) === read);
}

function levenshteinDistance(a, b) {
  const left = normalizeToken(a);
  const right = normalizeToken(b);
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let i = 0; i <= left.length; i += 1) matrix[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) matrix[0][j] = j;

  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[left.length][right.length];
}

function tokenSimilarity(sourceToken, readToken) {
  const source = normalizeToken(sourceToken);
  const read = normalizeToken(readToken);
  if (!source || !read) return 0;
  if (isPronunciationAllowed(source, read)) return 1;
  const maxLength = Math.max(source.length, read.length);
  return 1 - levenshteinDistance(source, read) / maxLength;
}

function isSubsequence(shorter, longer) {
  let index = 0;
  for (const char of longer) {
    if (char === shorter[index]) index += 1;
    if (index === shorter.length) return true;
  }
  return false;
}

function classifyReplacement(sourceToken, readToken) {
  const source = normalizeToken(sourceToken);
  const read = normalizeToken(readToken);

  if (source && read && isSubsequence(read, source) && read.length < source.length) {
    return {
      type: "생략",
      description: "원문 어절의 일부 음절 또는 형태소가 빠진 것으로 판단했습니다.",
      guidance: "빠뜨린 음절과 조사·어미를 확인하며 어절 단위로 정확히 읽도록 지도합니다."
    };
  }

  if (source && read && isSubsequence(source, read) && source.length < read.length) {
    return {
      type: "첨가",
      description: "원문 어절에 불필요한 음절 또는 형태가 추가된 것으로 판단했습니다.",
      guidance: "원문을 확인하며 불필요한 음절을 덧붙이지 않도록 지도합니다."
    };
  }

  return {
    type: "대치",
    description: "원문 어절을 다른 형태 또는 의미의 어절로 읽었습니다.",
    guidance: "원문을 눈으로 확인하며 유사 낱말과 조사·어미를 변별하는 연습을 합니다."
  };
}

function detectLeadingRepetition(token) {
  const normalized = String(token ?? "").replace(/[~\-—–]+/g, "");
  const jamoMatch = normalized.match(/^([ㄱ-ㅎ])\1+(.*)$/);
  if (jamoMatch?.[2]) {
    const cleaned = removeExtraInitialSyllable(jamoMatch[2]);
    return {
      normalized: cleaned,
      repeatedPart: jamoMatch[1],
      subtype: "음소반복"
    };
  }

  const syllableMatch = normalized.match(/^([가-힣])\1+(.*)$/);
  if (syllableMatch?.[2]) {
    return {
      normalized: syllableMatch[2],
      repeatedPart: syllableMatch[1],
      subtype: "음절반복"
    };
  }

  return null;
}

function getInitialConsonant(syllable) {
  const code = syllable.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "";
  const initials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  return initials[Math.floor(code / 588)] || "";
}

function removeExtraInitialSyllable(token) {
  const chars = [...token];
  if (chars.length < 2) return token;
  const firstInitial = getInitialConsonant(chars[0]);
  const secondInitial = getInitialConsonant(chars[1]);
  return firstInitial && firstInitial === secondInitial ? chars.slice(1).join("") : token;
}

function preprocessTranscript(transcript) {
  const rawTokens = tokenizeText(transcript);
  const tokens = [];
  const events = [];

  for (let index = 0; index < rawTokens.length; index += 1) {
    const rawToken = rawTokens[index];
    const normalized = normalizeToken(rawToken);

    if (!normalized || fillerWords.has(normalized)) {
      events.push({
        type: "첨가",
        source: "",
        transcript: rawToken,
        description: "원문에 없는 간투어 또는 음절 삽입으로 분류했습니다.",
        scoreImpact: true,
        errorSyllables: Math.max(countSyllables(normalized || rawToken), 1),
        guidance: "간투어를 줄이고 문장을 시작하기 전 호흡을 정리하도록 지도합니다."
      });
      continue;
    }

    if (normalized === "아니" && tokens.length && rawTokens[index + 1]) {
      const previous = tokens.pop();
      const corrected = rawTokens[index + 1];
      events.push({
        type: "자기교정",
        source: previous.raw,
        transcript: `${previous.raw} 아니 ${corrected}`,
        description: "처음 읽은 내용을 스스로 고쳐 읽었습니다. 최종 산출어로 정렬하되 자기교정 발생 자체는 점수에 반영합니다.",
        scoreImpact: true,
        errorSyllables: Math.max(countSyllables(previous.raw), 1),
        guidance: "자기점검 전략은 긍정적으로 보되, 처음 읽을 때의 정확성을 높이는 연습을 병행합니다."
      });
      tokens.push({ raw: corrected, normalized: normalizeToken(corrected) });
      index += 1;
      continue;
    }

    const repetition = detectLeadingRepetition(rawToken);
    if (repetition) {
      events.push({
        type: "반복",
        source: "",
        transcript: rawToken,
        description: `${repetition.subtype}으로 감지했습니다. 반복 음소/음절 개수와 관계없이 1회 오류로 처리하고, 반복 부분을 제거한 뒤 정렬합니다.`,
        scoreImpact: true,
        errorSyllables: 1,
        guidance: "짧은 구 단위 반복 읽기로 시작 지연과 부분어절 반복을 줄입니다."
      });
      tokens.push({ raw: repetition.normalized, normalized: normalizeToken(repetition.normalized) });
      continue;
    }

    tokens.push({ raw: rawToken, normalized });
  }

  return { tokens, events };
}

function alignTokens(sourceTokens, readTokenObjects) {
  const readTokens = readTokenObjects.map((item) => item.raw);
  const rows = sourceTokens.length + 1;
  const cols = readTokens.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));
  const back = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let i = 1; i < rows; i += 1) {
    dp[i][0] = i;
    back[i][0] = "delete";
  }
  for (let j = 1; j < cols; j += 1) {
    dp[0][j] = j;
    back[0][j] = "insert";
  }

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const similarity = tokenSimilarity(sourceTokens[i - 1], readTokens[j - 1]);
      const replaceCost = similarity >= 0.72 ? 0.25 : similarity >= 0.45 ? 0.65 : 1.15;
      const candidates = [
        { value: dp[i - 1][j - 1] + replaceCost, op: "replace" },
        { value: dp[i - 1][j] + 1, op: "delete" },
        { value: dp[i][j - 1] + 1, op: "insert" }
      ].sort((a, b) => a.value - b.value);

      dp[i][j] = candidates[0].value;
      back[i][j] = candidates[0].op;
    }
  }

  const operations = [];
  let i = sourceTokens.length;
  let j = readTokens.length;

  while (i > 0 || j > 0) {
    const op = back[i][j];
    if (op === "replace") {
      operations.unshift({ op, source: sourceTokens[i - 1], transcript: readTokens[j - 1] });
      i -= 1;
      j -= 1;
    } else if (op === "delete") {
      operations.unshift({ op, source: sourceTokens[i - 1], transcript: "" });
      i -= 1;
    } else {
      operations.unshift({ op: "insert", source: "", transcript: readTokens[j - 1] });
      j -= 1;
    }
  }

  return operations;
}

function compareTokens(passage, transcript) {
  const sourceTokens = tokenizeText(passage);
  const { tokens: readTokens, events } = preprocessTranscript(transcript);
  const operations = alignTokens(sourceTokens, readTokens);
  const rows = [...events];
  let correctWords = 0;
  let pronunciationCount = 0;
  let errorSyllables = 0;

  operations.forEach(({ op, source, transcript: read }) => {
    if (op === "replace") {
      if (normalizeToken(source) === normalizeToken(read)) {
        correctWords += 1;
        return;
      }

      if (isPronunciationAllowed(source, read)) {
        correctWords += 1;
        pronunciationCount += 1;
        return;
      }

      const replacement = classifyReplacement(source, read);
      rows.push({
        type: replacement.type,
        source,
        transcript: read,
        description: replacement.description,
        scoreImpact: true,
        errorSyllables: countSyllables(source),
        guidance: replacement.guidance
      });
      return;
    }

    if (op === "delete") {
      rows.push({
        type: "생략",
        source,
        transcript: "",
        description: "원문에 있는 어절을 읽지 않은 것으로 정렬되었습니다.",
        scoreImpact: true,
        errorSyllables: countSyllables(source),
        guidance: "손가락 짚기, 줄 따라 읽기, 어절 단위 끊어 읽기를 활용합니다."
      });
      return;
    }

    rows.push({
      type: "첨가",
      source: "",
      transcript: read,
      description: "원문에 없는 의미 있는 어절을 추가해 읽었습니다.",
      scoreImpact: true,
      errorSyllables: countSyllables(read),
      guidance: "추측하여 읽지 않고 원문을 정확히 확인하도록 지도합니다."
    });
  });

  errorSyllables = rows.reduce((sum, row) => {
    return row.scoreImpact ? sum + (row.errorSyllables || 0) : sum;
  }, 0);

  const counts = rows.reduce(
    (acc, row) => {
      if (row.type === "반복") acc.repetition += 1;
      if (row.type === "자기교정") acc.selfCorrection += 1;
      if (row.scoreImpact) acc[row.type] = (acc[row.type] || 0) + 1;
      return acc;
    },
    { repetition: 0, selfCorrection: 0 }
  );

  const actualErrorCount = ["생략", "첨가", "대치", "반복", "자기교정"].reduce((sum, type) => {
    return sum + (counts[type] || 0);
  }, 0);

  return {
    rows,
    summary: {
      totalWords: sourceTokens.length,
      correctWords,
      pronunciationCount,
      actualErrorCount,
      repetitionCount: counts.repetition,
      selfCorrectionCount: counts.selfCorrection
    },
    counts,
    errorSyllables
  };
}

function getMainErrorType(analysisResult) {
  const entries = ["생략", "첨가", "대치", "반복", "자기교정"]
    .map((type) => [type, analysisResult.counts[type] || 0])
    .sort((a, b) => b[1] - a[1]);
  const [type, count] = entries[0];
  return count > 0 ? `${type} 오류` : "두드러진 오류 없음";
}

function createReport({ formData, totalSyllables, errorSyllables, rate, comparison }) {
  const mainErrorType = getMainErrorType(comparison);
  const studentName = formData.studentName || "학생 A";
  const passageTitle = formData.passageTitle || "선택한 지문";
  const readingSecondsText = formData.seconds || "미입력";
  const summary = comparison.summary;
  const correctSyllables = Math.max(totalSyllables - errorSyllables, 0);

  return [
    `다음은 ${passageTitle} 지문을 활용한 문단글 읽기 유창성 검사 결과 해석 예시이다.`,
    `${studentName}는 ${passageTitle} 지문을 읽는 과정에서 전체 문단 음절 수 ${totalSyllables}음절 중 ${errorSyllables}음절에서 점수 반영 오류를 보였으며, 전체 소요시간은 ${readingSecondsText}초였다. 이에 따라 10초당 정확하게 읽은 음절 수는 [(${totalSyllables}-${errorSyllables})/${readingSecondsText}]×10으로 산출되며, 약 ${rate}음절로 계산된다.`,
    `정렬 분석 결과 전체 음절 ${totalSyllables}개 중 정확하게 읽은 음절은 ${correctSyllables}개이며, 발음 허용 ${summary.pronunciationCount}회, 실제 오류 ${summary.actualErrorCount}회, 반복 ${summary.repetitionCount}회, 자기교정 ${summary.selfCorrectionCount}회가 관찰되었다. 주요 오류 패턴은 ${mainErrorType}으로 요약된다.`
  ].join("\n ");
}

function analyzeReadingFluency(formData) {
  // TODO: Move advanced OpenAI-assisted analysis to Firebase Functions.
  const wordCount = countWords(formData.passage);
  const totalSyllables = countSyllables(formData.passage);
  const comparison = compareTokens(formData.passage, formData.transcript);
  const totalErrors = comparison.summary.actualErrorCount;
  const errorSyllables = comparison.errorSyllables;
  const rate = calculateReadingRate(totalSyllables, errorSyllables, Number(formData.seconds));
  const score = rate;

  return {
    wordCount,
    totalSyllables,
    errorSyllables,
    readingRate: rate,
    totalErrors,
    score,
    errorTypes: comparison.counts,
    summary: {
      ...comparison.summary,
      totalSyllables,
      correctSyllables: Math.max(totalSyllables - errorSyllables, 0)
    },
    errorRows: comparison.rows,
    report: createReport({ formData, totalSyllables, errorSyllables, rate, comparison })
  };
}

async function generateReportWithGpt(formData, analysis) {
  const response = await fetch("/.netlify/functions/generate-report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ragReference,
      formData,
      analysis: {
        totalSyllables: analysis.totalSyllables,
        errorSyllables: analysis.errorSyllables,
        readingRate: analysis.readingRate,
        totalErrors: analysis.totalErrors,
        summary: analysis.summary,
        errorRows: analysis.errorRows
      }
    })
  });

  if (!response.ok) {
    throw new Error("GPT 보고서 생성 API를 사용할 수 없습니다.");
  }

  const { reportText: generatedReport } = await response.json();
  return generatedReport;
}

function renderAnalysis(analysis) {
  readingRate.textContent = analysis.readingRate;
  errorCount.textContent = analysis.totalErrors;
  fluencyScore.textContent = analysis.score;
  reportText.value = analysis.report;
  analysisSummary.innerHTML = `
    <span>전체 음절 수 <strong>${analysis.summary.totalSyllables}</strong></span>
    <span>정확 음절 수 <strong>${analysis.summary.correctSyllables}</strong></span>
    <span>발음 허용 <strong>${analysis.summary.pronunciationCount}</strong></span>
    <span>실제 오류 <strong>${analysis.summary.actualErrorCount}</strong></span>
    <span>반복 <strong>${analysis.summary.repetitionCount}</strong></span>
    <span>자기교정 <strong>${analysis.summary.selfCorrectionCount}</strong></span>
  `;

  errorTableBody.innerHTML = analysis.errorRows
    .map((row) => `
      <tr>
        <td><span class="badge">${escapeHtml(row.type)}</span></td>
        <td>${escapeHtml(row.source || "-")}</td>
        <td>${escapeHtml(row.transcript || "-")}</td>
        <td>${escapeHtml(row.description)}</td>
        <td>${row.scoreImpact ? "-1" : "0"}</td>
        <td>${escapeHtml(row.guidance)}</td>
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
    mainErrorType: getMainErrorType({ counts: analysis.errorTypes }),
    summary: analysis.summary,
    finalScore: analysis.score,
    reportText: reportText.value.trim(),
    createdAt: new Date().toISOString()
  };
}

async function saveAnalysisResult() {
  const formData = getFormData();

  if (!latestAnalysis) {
    saveMessage.textContent = "저장 전 분석하기를 먼저 실행해 주세요.";
    return;
  }

  if (!formData.studentName || !formData.assessmentDate || !formData.passageTitle) {
    saveMessage.textContent = "학생 이름, 검사 날짜, 검사 문단을 확인한 뒤 저장해 주세요.";
    return;
  }

  const analysisResultData = buildAnalysisResultData(formData, latestAnalysis);
  const savedResult = await saveAssessmentResult(analysisResultData);
  console.log("저장된 분석 결과:", savedResult);
  saveMessage.textContent = "분석 결과가 저장되었습니다. 교사 모니터링 페이지에서 확인할 수 있습니다.";
}

function tempSaveReport() {
  const formData = getFormData();
  const temporaryData = {
    ...formData,
    analysis: latestAnalysis,
    reportText: reportText.value.trim(),
    savedAt: new Date().toISOString()
  };

  console.log("학생별 임시저장 데이터:", temporaryData);
  saveMessage.textContent = "학생별 입력 및 분석 임시저장 데이터를 콘솔에서 확인할 수 있습니다.";
}

async function requestTranscriptionFromServer() {
  // TODO: Send the in-memory audio blob to Firebase Functions and return text.
  // Do not persist the original recording file in Firebase Storage or Firestore.
  if (liveTranscript.trim()) return liveTranscript.trim();
  if (!recordedChunks.length) return "";
  const audioBlob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || "audio/webm" });
  return transcribeAudioFile(new File([audioBlob], "browser-recording.webm", { type: audioBlob.type }));
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const result = String(reader.result || "");
      resolve(result.split(",")[1] || "");
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

async function transcribeAudioFile(file) {
  const audioBase64 = await fileToBase64(file);
  const response = await fetch("/.netlify/functions/transcribe-audio", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      audioBase64,
      fileName: file.name,
      mimeType: file.type || "audio/webm"
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error([error.error, error.hint].filter(Boolean).join(" ") || "오디오 전사 API를 사용할 수 없습니다.");
  }

  const { text } = await response.json();
  return text?.trim() || "";
}

function createSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("result", (event) => {
    let finalText = "";
    let interimText = "";

    for (let index = 0; index < event.results.length; index += 1) {
      const result = event.results[index];
      const transcript = result[0]?.transcript?.trim();
      if (!transcript) continue;

      if (result.isFinal) {
        finalText += `${transcript} `;
      } else {
        interimText += `${transcript} `;
      }
    }

    liveTranscript = `${finalText}${interimText}`.trim();
    if (liveTranscript) {
      transcriptInput.value = liveTranscript;
    }
  });

  recognition.addEventListener("error", () => {
    recordStatus.textContent = "녹음 중입니다. 브라우저 전사가 중단되면 녹음 후 전사 파일을 업로드해 주세요.";
  });

  return recognition;
}

function startSpeechRecognition() {
  speechRecognition = createSpeechRecognition();
  if (!speechRecognition) {
    recordStatus.textContent = "녹음 중... 현재 브라우저는 실시간 전사를 지원하지 않습니다.";
    return;
  }

  try {
    speechRecognition.start();
  } catch {
    // Some browsers throw if recognition is already starting.
  }
}

function stopSpeechRecognition() {
  if (!speechRecognition) return;
  try {
    speechRecognition.stop();
  } catch {
    // Ignore stop errors from browser-specific recognition state.
  }
}

function startAudioMeter(stream) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;

  audioContext = new AudioContextConstructor();
  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 256;

  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyserNode);

  const samples = new Uint8Array(analyserNode.frequencyBinCount);

  function updateMeter() {
    analyserNode.getByteFrequencyData(samples);
    const average = samples.reduce((sum, value) => sum + value, 0) / samples.length;
    const level = Math.min(100, Math.round((average / 140) * 100));
    audioMeter.style.setProperty("--level", `${level}%`);
    audioMeter.classList.add("is-active");
    meterAnimationId = requestAnimationFrame(updateMeter);
  }

  updateMeter();
}

function stopAudioMeter() {
  if (meterAnimationId) {
    cancelAnimationFrame(meterAnimationId);
    meterAnimationId = null;
  }

  audioMeter.style.setProperty("--level", "0%");
  audioMeter.classList.remove("is-active");

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
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

audioFile.addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;

  uploadedAudioFile = file;

  if (uploadedAudioUrl) {
    URL.revokeObjectURL(uploadedAudioUrl);
  }

  uploadedAudioUrl = URL.createObjectURL(file);
  uploadedAudioPreview.src = uploadedAudioUrl;
  uploadedAudioPreview.hidden = false;
  convertUploadedAudioButton.disabled = false;
  audioUploadStatus.textContent = `${file.name} 파일을 불러왔습니다. 미리듣기 후 텍스트 변환을 진행할 수 있습니다.`;
});

startRecordingButton.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    recordedChunks = [];
    liveTranscript = "";

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      recordedAudioUrl = "";
    }

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recordedChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", () => {
      stream.getTracks().forEach((track) => track.stop());
      stopAudioMeter();
      stopSpeechRecognition();
      const audioBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || "audio/webm" });
      recordedAudioUrl = URL.createObjectURL(audioBlob);
      audioPreview.src = recordedAudioUrl;
      audioPreview.hidden = false;
      convertRecordingButton.disabled = false;
      recordStatus.textContent = liveTranscript
        ? "녹음 완료 - 전사 텍스트가 입력되었습니다. 필요하면 수정해 주세요."
        : "녹음 완료 - 미리듣기가 준비되었습니다. 브라우저 전사가 없으면 전사 파일 업로드 또는 서버 STT 연동이 필요합니다.";
    });

    const supportsSpeechRecognition = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    mediaRecorder.start();
    startAudioMeter(stream);
    startSpeechRecognition();
    startRecordingButton.disabled = true;
    stopRecordingButton.disabled = false;
    convertRecordingButton.disabled = false;
    audioPreview.hidden = true;
    recordStatus.textContent = supportsSpeechRecognition
      ? "녹음 중... 마이크 입력이 감지되면 아래 막대가 움직이고 전사 텍스트가 표시됩니다."
      : "녹음 중... 마이크 입력이 감지되면 아래 막대가 움직입니다. 현재 브라우저는 실시간 전사를 지원하지 않습니다.";
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
  if (convertedText) {
    transcriptInput.value = convertedText;
    recordStatus.textContent = "녹음 전사 텍스트를 전사 영역에 반영했습니다.";
    return;
  }

  recordStatus.textContent = "현재 브라우저 전사 결과가 없습니다. Chrome에서 다시 녹음하거나 STT 전사 txt 파일을 업로드해 주세요.";
});

convertUploadedAudioButton.addEventListener("click", async () => {
  if (!uploadedAudioFile) {
    audioUploadStatus.textContent = "먼저 녹음파일을 업로드해 주세요.";
    return;
  }

  try {
    convertUploadedAudioButton.disabled = true;
    audioUploadStatus.textContent = "업로드 녹음파일을 텍스트로 변환하는 중입니다.";
    const transcript = await transcribeAudioFile(uploadedAudioFile);

    if (!transcript) {
      audioUploadStatus.textContent = "전사 결과가 비어 있습니다. 녹음 품질이나 파일 형식을 확인해 주세요.";
      return;
    }

    transcriptInput.value = transcript;
    audioUploadStatus.textContent = "업로드 녹음파일의 전사 결과를 전사 텍스트 영역에 반영했습니다.";
  } catch (error) {
    console.error(error);
    audioUploadStatus.textContent = `오디오 전사에 실패했습니다. ${error.message}`;
  } finally {
    convertUploadedAudioButton.disabled = false;
  }
});

analyzeButton.addEventListener("click", async () => {
  const formData = getFormData();

  if (!formData.passage || !formData.transcript || !formData.seconds) {
    saveMessage.textContent = "문단글 선택, 전사 텍스트, 읽기 시간을 먼저 입력해 주세요.";
    return;
  }

  latestAnalysis = analyzeReadingFluency(formData);
  renderAnalysis(latestAnalysis);
  saveMessage.textContent = "기준 자료 기반 분석 결과를 생성했습니다. GPT 보고서를 생성하는 중입니다.";

  try {
    const generatedReport = await generateReportWithGpt(formData, latestAnalysis);
    if (generatedReport) {
      latestAnalysis.report = generatedReport;
      reportText.value = generatedReport;
      saveMessage.textContent = "RAG 기준 자료와 GPT API를 활용해 보고서를 생성했습니다.";
      return;
    }
  } catch (error) {
    console.warn(error);
  }

  saveMessage.textContent = "분석 결과가 생성되었습니다. GPT API 미설정 시 기본 보고서 초안을 사용합니다.";
});

saveResultButton.addEventListener("click", saveAnalysisResult);
tempSaveReportButton.addEventListener("click", tempSaveReport);
pageLogoutButton.addEventListener("click", async () => {
  await clearTeacherSession();
  window.location.href = "index.html";
});

renderInputMethod();
renderPassage();
updateChronologicalAge();
