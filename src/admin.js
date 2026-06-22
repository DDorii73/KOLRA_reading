import { fetchAssessmentResults, requireTeacherAuth } from "./firebaseConfig.js";

const teacherSession = requireTeacherAuth();
if (!teacherSession) {
  throw new Error("Teacher authentication required.");
}

const monitorTableBody = document.querySelector("#monitorTableBody");
const selectedDetail = document.querySelector("#selectedDetail");
const refreshResultsButton = document.querySelector("#refreshResultsButton");
const studentNameSearch = document.querySelector("#studentNameSearch");
const testDateSearch = document.querySelector("#testDateSearch");

let results = [];

const sampleResults = [
  {
    id: "sample-1",
    studentName: "김민준",
    testDate: "2026-06-11",
    passageTitle: "1,2학년 수준 [김밥만들기]",
    readingSpeed: 84,
    finalScore: 92,
    mainErrorType: "대치 오류",
    errorAnalysis: [
      {
        type: "대치",
        count: 2,
        errorWords: "작은→자근"
      },
      {
        type: "생략",
        count: 1,
        errorWords: "천천히"
      }
    ],
    reportText: "학생 기본 정보: 김민준\n읽기 속도 결과: 분당 84어절\n주요 오류 유형: 대치 오류\n유창성 수준 요약: 안정적인 수준\n강점: 끝까지 읽기를 수행했습니다.\n보완이 필요한 점: 비슷한 어절 구별이 필요합니다.\n지도 제안: 원문 확인 후 다시 읽기를 권장합니다."
  },
  {
    id: "sample-2",
    studentName: "이서연",
    testDate: "2026-06-10",
    passageTitle: "3,4학년 수준 [산과 바다]",
    readingSpeed: 61,
    finalScore: 72,
    mainErrorType: "생략 오류",
    errorAnalysis: [
      {
        type: "생략",
        count: 6,
        errorWords: "창가, 부드럽게"
      },
      {
        type: "삽입",
        count: 3,
        errorWords: "그리고"
      }
    ],
    reportText: "학생 기본 정보: 이서연\n읽기 속도 결과: 분당 61어절\n주요 오류 유형: 생략 오류\n유창성 수준 요약: 정확도와 속도 보완이 필요한 수준\n강점: 긴 문단을 끝까지 읽었습니다.\n보완이 필요한 점: 누락 없이 읽는 정확도 향상이 필요합니다.\n지도 제안: 의미 단위 끊어 읽기와 반복 읽기를 권장합니다."
  }
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getVisibleResults() {
  const nameKeyword = studentNameSearch.value.trim().toLowerCase();
  const selectedDate = testDateSearch.value;

  return results.filter((result) => {
    const nameMatches = !nameKeyword || String(result.studentName ?? "").toLowerCase().includes(nameKeyword);
    const resultDate = result.testDate || result.assessmentDate || "";
    const dateMatches = !selectedDate || resultDate === selectedDate;

    return nameMatches && dateMatches;
  });
}

function getMainErrorType(result) {
  if (result.mainErrorType) return result.mainErrorType;

  const errorRows = result.errorAnalysis || [];
  if (!errorRows.length) return "분석 전";

  const [mainError] = [...errorRows].sort((a, b) => Number(b.count || 0) - Number(a.count || 0));
  return mainError?.type ? `${mainError.type} 오류` : "분석 전";
}

function renderTable() {
  const visibleResults = getVisibleResults();

  if (!visibleResults.length) {
    monitorTableBody.innerHTML = '<tr><td colspan="6">조회할 검사 결과가 없습니다.</td></tr>';
    return;
  }

  monitorTableBody.innerHTML = visibleResults
    .map((result) => `
      <tr>
        <td>${escapeHtml(result.studentName)}</td>
        <td>${escapeHtml(result.testDate || result.assessmentDate)}</td>
        <td>${escapeHtml(result.readingSpeed || result.readingRate)} 음절/10초</td>
        <td><strong>${escapeHtml(result.finalScore)}</strong></td>
        <td><span class="badge">${escapeHtml(getMainErrorType(result))}</span></td>
        <td>
          <button class="table-button" type="button" data-result-id="${escapeHtml(result.id)}">상세 보기</button>
        </td>
      </tr>
    `)
    .join("");
}

function renderErrorAnalysisTable(errorAnalysis = []) {
  if (!errorAnalysis.length) {
    return '<p>표시할 학생 개별 분석 표가 없습니다.</p>';
  }

  return `
    <div class="table-wrap detail-table">
      <table>
        <thead>
          <tr>
            <th>오류 유형</th>
            <th>원문</th>
            <th>전사문</th>
            <th>설명</th>
            <th>점수</th>
            <th>지도 방향</th>
          </tr>
        </thead>
        <tbody>
          ${errorAnalysis
            .map((row) => `
              <tr>
                <td><span class="badge">${escapeHtml(row.type)}</span></td>
                <td>${escapeHtml(row.source || "-")}</td>
                <td>${escapeHtml(row.transcript || row.errorWords || "-")}</td>
                <td>${escapeHtml(row.description || "-")}</td>
                <td>${row.scoreImpact ? "-1" : "0"}</td>
                <td>${escapeHtml(row.guidance || "-")}</td>
              </tr>
            `)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderDetail(result) {
  selectedDetail.innerHTML = `
    <h3>${escapeHtml(result.studentName)} 학생 상세 결과</h3>
    <dl>
      <div><dt>검사 날짜</dt><dd>${escapeHtml(result.testDate || result.assessmentDate)}</dd></div>
      <div><dt>검사 문단</dt><dd>${escapeHtml(result.passageTitle || "-")}</dd></div>
      <div><dt>읽기 속도</dt><dd>${escapeHtml(result.readingSpeed || result.readingRate)} 음절/10초</dd></div>
      <div><dt>최종 점수</dt><dd>${escapeHtml(result.finalScore)}점</dd></div>
      <div><dt>주요 오류 유형</dt><dd>${escapeHtml(getMainErrorType(result))}</dd></div>
    </dl>
    <h4>학생 개별 분석 표</h4>
    ${renderErrorAnalysisTable(result.errorAnalysis)}
    <h4>학생 개별 보고서</h4>
    <pre class="report-text">${escapeHtml(result.reportText || result.report || "보고서 내용이 없습니다.")}</pre>
  `;
}

async function loadResults() {
  const savedResults = await fetchAssessmentResults();
  results = savedResults.length ? savedResults.map(normalizeSavedResult) : sampleResults;
  renderTable();
}

function normalizeSavedResult(result) {
  return {
    ...result,
    testDate: result.testDate || result.assessmentDate,
    readingSpeed: result.readingSpeed || result.readingRate,
    reportText: result.reportText || result.report,
    errorAnalysis: Array.isArray(result.errorAnalysis)
      ? result.errorAnalysis
      : []
  };
}

monitorTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-result-id]");
  if (!button) return;

  const result = results.find((item) => item.id === button.dataset.resultId);
  if (result) renderDetail(result);
});

refreshResultsButton.addEventListener("click", loadResults);
studentNameSearch.addEventListener("input", renderTable);
testDateSearch.addEventListener("input", renderTable);

loadResults();
