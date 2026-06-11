import { fetchAssessmentResults, requireTeacherAuth } from "./firebaseConfig.js";

requireTeacherAuth();

const monitorTableBody = document.querySelector("#monitorTableBody");
const selectedReport = document.querySelector("#selectedReport");
const refreshResultsButton = document.querySelector("#refreshResultsButton");
const studentSearch = document.querySelector("#studentSearch");
const totalAssessments = document.querySelector("#totalAssessments");
const averageRate = document.querySelector("#averageRate");
const averageScore = document.querySelector("#averageScore");
const needsSupport = document.querySelector("#needsSupport");

let results = [];

const sampleResults = [
  {
    id: "sample-1",
    studentName: "김민준",
    studentGrade: "2학년",
    assessmentDate: "2026-06-11",
    readingRate: 84,
    totalErrors: 4,
    finalScore: 92,
    report: "읽기 속도는 안정적이며 일부 대치 오류가 관찰되었습니다. 다음 검사에서는 문장 끝 억양과 정확한 어절 읽기를 함께 확인해 주세요."
  },
  {
    id: "sample-2",
    studentName: "이서연",
    studentGrade: "3학년",
    assessmentDate: "2026-06-10",
    readingRate: 61,
    totalErrors: 11,
    finalScore: 72,
    report: "읽기 속도와 정확도 모두 추가 관찰이 필요합니다. 짧은 문단부터 의미 단위로 끊어 읽는 연습을 권장합니다."
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
  const keyword = studentSearch.value.trim().toLowerCase();
  if (!keyword) return results;

  return results.filter((result) => {
    return [result.studentName, result.studentGrade, result.assessmentDate]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });
}

function renderSummary(visibleResults) {
  const count = visibleResults.length;
  const rateTotal = visibleResults.reduce((sum, result) => sum + Number(result.readingRate || 0), 0);
  const scoreTotal = visibleResults.reduce((sum, result) => sum + Number(result.finalScore || 0), 0);
  const supportCount = visibleResults.filter((result) => Number(result.finalScore || 0) < 80).length;

  totalAssessments.textContent = count;
  averageRate.textContent = count ? `${Math.round(rateTotal / count)} 어절/분` : "-";
  averageScore.textContent = count ? `${Math.round(scoreTotal / count)}점` : "-";
  needsSupport.textContent = supportCount;
}

function renderTable() {
  const visibleResults = getVisibleResults();
  renderSummary(visibleResults);

  if (!visibleResults.length) {
    monitorTableBody.innerHTML = '<tr><td colspan="7">조회할 검사 결과가 없습니다.</td></tr>';
    return;
  }

  monitorTableBody.innerHTML = visibleResults
    .map((result) => `
      <tr>
        <td>${escapeHtml(result.studentName)}</td>
        <td>${escapeHtml(result.studentGrade)}</td>
        <td>${escapeHtml(result.assessmentDate)}</td>
        <td>${escapeHtml(result.readingRate)} 어절/분</td>
        <td>${escapeHtml(result.totalErrors)}</td>
        <td><strong>${escapeHtml(result.finalScore)}</strong></td>
        <td>
          <button class="table-button" type="button" data-report-id="${escapeHtml(result.id)}">보기</button>
        </td>
      </tr>
    `)
    .join("");
}

function renderReport(result) {
  selectedReport.innerHTML = `
    <h3>${escapeHtml(result.studentName)} 학생 개별 보고서</h3>
    <dl>
      <div><dt>학년</dt><dd>${escapeHtml(result.studentGrade)}</dd></div>
      <div><dt>검사일</dt><dd>${escapeHtml(result.assessmentDate)}</dd></div>
      <div><dt>읽기 속도</dt><dd>${escapeHtml(result.readingRate)} 어절/분</dd></div>
      <div><dt>최종 점수</dt><dd>${escapeHtml(result.finalScore)}점</dd></div>
    </dl>
    <p>${escapeHtml(result.report)}</p>
  `;
}

async function loadResults() {
  const savedResults = await fetchAssessmentResults();
  results = savedResults.length ? savedResults : sampleResults;
  renderTable();
}

monitorTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-report-id]");
  if (!button) return;

  const result = results.find((item) => item.id === button.dataset.reportId);
  if (result) renderReport(result);
});

refreshResultsButton.addEventListener("click", loadResults);
studentSearch.addEventListener("input", renderTable);

loadResults();
