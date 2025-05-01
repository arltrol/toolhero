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
Return only a valid JSON array of 4 objects.
Each object should include:
- name (string)
- description (string)
- link (URL string)
No explanation, no markdown. Return only JSON.
`;

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

    // Filter out tools with invalid links
    tools = tools.filter(tool => {
      try {
        const url = new URL(tool.link);
        return (
          url.hostname &&
          !url.hostname.includes("godaddy") &&
          !url.hostname.endsWith(".godaddysites.com") &&
          !url.hostname.includes("example.com")
        );
      } catch (e) {
        return false;
      }
    });

    console.log("✅ Valid tools:", tools.length);
    return {
      statusCode: 200,
      body: JSON.stringify({ tools }),
    };
  } catch (err) {
    console.error("❌ GPT or JSON Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
