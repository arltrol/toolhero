const OpenAI = require("openai");

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
Suggest at least 8 AI tools for the following use case: "${useCase}".
Return only a valid JSON array of objects with the following fields:
- name (string)
- description (string)
- link (URL string)
No explanation or markdown. Output only JSON.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let content = response.choices[0].message.content.trim();
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");
    const jsonString = content.slice(firstBracket, lastBracket + 1);

    let tools = JSON.parse(jsonString);
    const sliced = tools.slice(0, 5); // just take the first 5

    return {
      statusCode: 200,
      body: JSON.stringify({ tools: sliced }),
    };
  } catch (err) {
    console.error("❌ GPT or JSON Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
