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
You are a helpful assistant recommending AI tools. 
Return ONLY a valid JSON array (no markdown, no explanation) for the following use case:

"${useCase}"

The array must contain exactly 4 objects. Each object must include:
- name (string)
- description (string)
- link (URL string)

Output ONLY the JSON array, with no introduction or formatting.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let resultText = response.choices[0].message.content.trim();
    console.log("🧪 Raw GPT output:", resultText.slice(0, 120));

    // Try to clean output if it starts with markdown or explanations
    const firstBrace = resultText.indexOf("[");
    const lastBrace = resultText.lastIndexOf("]");
    if (firstBrace !== -1 && lastBrace !== -1) {
      resultText = resultText.slice(firstBrace, lastBrace + 1); // trim to array
    }

    // Validate JSON
    try {
      const parsed = JSON.parse(resultText); // just to confirm it's valid
      console.log("✅ JSON validated");
    } catch (e) {
      console.error("❌ Invalid JSON format:", e.message);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GPT output was not valid JSON." }),
      };
    }

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
