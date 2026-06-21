function parseRequestBody(body) {
  try {
    return JSON.parse(body || "{}");
  } catch {
    return {};
  }
}

function base64ToBlob(base64, mimeType) {
  const binary = Buffer.from(base64, "base64");
  return new Blob([binary], { type: mimeType || "audio/webm" });
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

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({ error: "OPENAI_API_KEY is not configured." })
    };
  }

  const { audioBase64, fileName, mimeType } = parseRequestBody(event.body);
  if (!audioBase64) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "audioBase64 is required." })
    };
  }

  try {
    const formData = new FormData();
    const audioBlob = base64ToBlob(audioBase64, mimeType);
    formData.append("file", audioBlob, fileName || "reading-audio.webm");
    formData.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
    formData.append("language", "ko");

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`
      },
      body: formData
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: data.text || "" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
}
