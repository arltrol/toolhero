const { Configuration, OpenAIApi } = require("openai");

exports.handler = async (event, context) => {
  console.log("🔹 Function triggered");
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    console.error("❌ OPENAI_API_KEY is missing in environment variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENAI_API_KEY is not set in environment." }),
    };
  }

  const body = JSON.parse(event.body);
  const useCase = body.useCase;

  console.log("🔹 Use case received:", useCase);

  const configuration = new Configuration({ apiKey: key });
  const openai = new OpenAIApi(configuration);

  const prompt = `Suggest 4 AI tools for the following use case: "${useCase}". Format them in JSON with fields: name, description, and link.`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const resultText = response.data.choices[0].message.content;

    console.log("✅ GPT response received");

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
