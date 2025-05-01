const OpenAI = require("openai");
const https = require("https");

exports.handler = async function(event) {
  console.log("🔹 Function triggered");
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    console.error("❌ OPENAI_API_KEY is missing.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENAI_API_KEY not set." }),
    };
  }

  const body = JSON.parse(event.body);
  const useCase = body.useCase;
  console.log("🔹 Use case received:", useCase);

  const openai = new OpenAI({ apiKey: key });

  const prompt = `
Suggest 4 AI tools for the following use case: "${useCase}".
Return only a valid JSON array of 4 objects.
Each object should include:
- name (string)
- description (string)
- link (URL string)
No explanation, no markdown. Return only JSON.
`;

  const isValidURL = async (url) => {
    return new Promise((resolve) => {
      try {
        const req = https.request(url, { method: "HEAD", timeout: 3000 }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        });
        req.on("error", () => resolve(false));
        req.end();
      } catch {
        resolve(false);
      }
    });
  };

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let content = response.choices[0].message.content.trim();
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");
    const jsonString = content.slice(firstBracket, lastBracket + 1);

    let tools = JSON.parse(jsonString);

    // Filter out invalid or empty websites
    const filtered = [];
    for (const tool of tools) {
      try {
        const urlObj = new URL(tool.link);
        const domain = urlObj.hostname;
        if (
          !domain.includes("godaddy") &&
          !domain.includes("example.com") &&
          await isValidURL(tool.link)
        ) {
          filtered.push(tool);
        }
      } catch {}
    }

    console.log("✅ Valid tools:", filtered.length);

    return {
      statusCode: 200,
      body: JSON.stringify({ tools: filtered }),
    };
  } catch (err) {
    console.error("❌ GPT or JSON Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
