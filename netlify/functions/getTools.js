const OpenAI = require("openai");

exports.handler = async (event, context) => {
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
  Return only a JSON array with the following fields:
  - name
  - description
  - link

  Do not include any explanation, title, or markdown. Just return valid JSON.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultText = response.choices[0].message.content.trim();
    console.log("✅ GPT Response:", resultText.slice(0, 100));

    return {
      statusCode: 200,
      body: JSON.stringify({ tools: resultText }),
    };
  } catch (err) {
    console.error("❌ GPT API Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
