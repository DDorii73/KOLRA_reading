function getOpenAiApiKey() {
  return (
    process.env.OPENAI_API_KEY ||
    process.env.VITE_OPENAI_API_KEY ||
    process.env.OPENAI_KEY ||
    ""
  ).trim();
}

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  const apiKey = getOpenAiApiKey();

  if (!apiKey) {
    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({
        error: "OpenAI API key is not configured for this Netlify Function.",
        hint: "Set OPENAI_API_KEY in Netlify Environment variables for Functions/Production, then redeploy."
      })
    };
  }

  try {
    const { ragReference, formData, analysis } = JSON.parse(event.body || "{}");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: [
              "너는 초등 문단글 읽기 유창성 평가를 보조하는 교사용 평가 보고서 작성자다.",
              "제공된 RAG 기준 자료를 최우선으로 사용한다.",
              "학생에게 직접 점수 피드백을 주지 말고, 교사가 해석할 수 있는 진단적 문장으로 작성한다.",
              "한국어 음운 변동은 오류로 단정하지 않는다는 원칙을 반영한다.",
              "보고서는 간결하되 전문적으로 작성한다."
            ].join("\n")
          },
          {
            role: "user",
            content: JSON.stringify(
              {
                ragReference,
                formData,
                analysis,
                requiredReportStyle:
                  "문단글 읽기 유창성 검사 결과 해석 예시 문체로 작성하고, 전체 음절 수, 오류 음절 수, 소요시간, 산식, 오류 유형 요약, 교사용 해석 및 지도 방향을 포함한다."
              },
              null,
              2
            )
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: errorText })
      };
    }

    const data = await response.json();
    const reportText = data.choices?.[0]?.message?.content?.trim();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reportText })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
